/**
 * Capture guest Home + onboarding hero with layout locked.
 * Writes assets/page.png, assets/hero.png, assets/floaters/*.png, assets/layout.json
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "assets");
const FLOATERS = path.join(ASSETS, "floaters");
const WIDTH = 1440;
const BASE = "https://app-todoad.netlify.app";

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  html, body { overflow: visible !important; }
`;

async function ensureDirs() {
  await fs.mkdir(FLOATERS, { recursive: true });
}

async function lockAndWait(page) {
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(800);
}

async function captureGuestHome(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 90000 });
  await lockAndWait(page);

  const guest = page.getByRole("button", { name: /Explore as Guest/i });
  await guest.click();
  await page.waitForURL(/\/(home)?$/, { timeout: 60000 }).catch(() => {});
  if (!page.url().includes("/home")) {
    await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 90000 });
  }
  await page.waitForSelector('button[aria-expanded], a[aria-label="Search tasks"]', { timeout: 60000 });
  await lockAndWait(page);

  // Expand first week so mobile-style content is present; desktop still shows right panel.
  const firstWeek = page.locator("section > button[aria-expanded]").first();
  if (await firstWeek.count()) {
    const expanded = await firstWeek.getAttribute("aria-expanded");
    if (expanded !== "true") await firstWeek.click();
  }
  await page.waitForTimeout(400);
  await lockAndWait(page);

  const scrollHeight = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
  await page.setViewportSize({ width: WIDTH, height: Math.min(Math.max(scrollHeight, 900), 4000) });
  await page.waitForTimeout(300);

  const pagePath = path.join(ASSETS, "page.png");
  await page.screenshot({ path: pagePath, fullPage: true, type: "png" });

  const pageMeta = await sharp(pagePath).metadata();
  const pageW = pageMeta.width;
  const pageH = pageMeta.height;

  // Collect float candidates with page coordinates.
  const candidates = await page.evaluate(() => {
    const picks = [];
    const push = (el, id, kind) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      if (r.width < 40 || r.height < 24) return;
      picks.push({
        id,
        kind,
        x: Math.round(r.left + scrollX),
        y: Math.round(r.top + scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    };

    document.querySelectorAll("section").forEach((sec, i) => {
      if (sec.querySelector(":scope > button[aria-expanded]")) push(sec, `week-${i}`, "week-card");
    });
    document.querySelectorAll('a[aria-label="Search tasks"], label').forEach((el, i) => {
      if (el.matches('a[aria-label="Search tasks"]') || el.querySelector('input[placeholder*="Search"]')) {
        push(el, `search-${i}`, "search");
      }
    });
    document.querySelectorAll("button").forEach((btn, i) => {
      const t = (btn.getAttribute("aria-label") || btn.textContent || "").trim();
      if (t === "Add task" || /add/i.test(btn.getAttribute("aria-label") || "")) {
        push(btn, `fab-${i}`, "fab");
      }
    });
    document.querySelectorAll("p").forEach((p, i) => {
      if (/Guest Demo/i.test(p.textContent || "")) push(p, `banner-${i}`, "banner");
    });
    // Compact summary tiles inside week cards
    document.querySelectorAll("section .grid.grid-cols-2 > div").forEach((tile, i) => {
      push(tile, `tile-${i}`, "summary-tile");
    });
    return picks;
  });

  // Deduplicate overlapping / nested (prefer week cards over tiles if fully inside — keep both for lift variety)
  const floaters = [];
  let lift = 22;
  for (const c of candidates) {
    if (c.x < 0 || c.y < 0) continue;
    if (c.x + c.w > pageW + 20 || c.y + c.h > pageH + 20) {
      c.w = Math.min(c.w, pageW - c.x);
      c.h = Math.min(c.h, pageH - c.y);
    }
    if (c.w < 40 || c.h < 24) continue;
    const outName = `${c.id}.png`;
    const outPath = path.join(FLOATERS, outName);
    try {
      await sharp(pagePath)
        .extract({
          left: Math.max(0, c.x),
          top: Math.max(0, c.y),
          width: Math.min(c.w, pageW - Math.max(0, c.x)),
          height: Math.min(c.h, pageH - Math.max(0, c.y)),
        })
        .png()
        .toFile(outPath);
      floaters.push({
        ...c,
        file: `floaters/${outName}`,
        zLift: lift,
      });
      lift = lift === 40 ? 22 : lift + 3;
      if (lift > 40) lift = 22;
    } catch {
      // skip failed crops
    }
  }

  // Cap floaters for performance — prefer week cards + search + a few tiles
  const ranked = [
    ...floaters.filter((f) => f.kind === "week-card"),
    ...floaters.filter((f) => f.kind === "search"),
    ...floaters.filter((f) => f.kind === "fab"),
    ...floaters.filter((f) => f.kind === "banner"),
    ...floaters.filter((f) => f.kind === "summary-tile").slice(0, 4),
  ].slice(0, 12);

  return {
    page: { file: "page.png", width: pageW, height: pageH },
    floaters: ranked,
    viewport: { width: WIDTH, height: pageH },
  };
}

async function captureHero(context) {
  const page = await context.newPage();
  await page.setViewportSize({ width: WIDTH, height: 1152 });
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("todo-seen-onboarding");
    } catch {
      /* ignore */
    }
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
  await lockAndWait(page);
  // Wait for onboarding content (not redirect loading)
  await page.waitForSelector("text=Manage What To Do", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(500);
  const heroPath = path.join(ASSETS, "hero.png");
  await page.screenshot({ path: heroPath, type: "png" });
  const meta = await sharp(heroPath).metadata();
  await page.close();
  return { file: "hero.png", width: meta.width, height: meta.height };
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: 1152 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log("Capturing guest Home…");
  const home = await captureGuestHome(page);
  console.log("Capturing onboarding hero…");
  const hero = await captureHero(context);

  const layout = {
    brand: "To-Do",
    headline: "Manage What To Do",
    italicTail: "don't forget your plans",
    output: { width: 1440, height: 1152 },
    duration: 14.5,
    page: home.page,
    hero,
    floaters: home.floaters,
    capturedAt: new Date().toISOString(),
  };

  await fs.writeFile(path.join(ASSETS, "layout.json"), JSON.stringify(layout, null, 2));
  console.log(`Done. page ${home.page.width}x${home.page.height}, floaters=${home.floaters.length}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
