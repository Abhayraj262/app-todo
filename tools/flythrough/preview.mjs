/**
 * Seek the WebGL scene and export still previews at key times.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PREVIEWS = path.join(ROOT, "previews");
const TIMES = [0, 1.6, 2.5, 5, 6.5, 9.3, 11];
const PORT = 8765;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".woff2": "font/woff2",
};

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(ROOT, urlPath === "/" ? "scene/index.html" : urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found: " + urlPath);
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  await fsp.mkdir(PREVIEWS, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1152 },
    deviceScaleFactor: 1,
  });

  await page.goto(`http://127.0.0.1:${PORT}/scene/index.html`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(() => window.__fly?.ready === true, null, { timeout: 120000 });
  await page.waitForTimeout(500);

  for (const t of TIMES) {
    await page.evaluate((time) => window.__fly.setTime(time), t);
    await page.waitForTimeout(200);
    const name = `t-${String(t).replace(".", "_")}s.png`;
    const out = path.join(PREVIEWS, name);
    // Full page includes title overlay DOM
    await page.screenshot({ path: out, type: "png", clip: { x: 0, y: 0, width: 1440, height: 1152 } });
    console.log("wrote", name);
  }

  await browser.close();
  server.close();
  console.log("Previews done →", PREVIEWS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
