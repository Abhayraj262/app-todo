/**
 * Render 14.5s @ 60fps with 16-subframe motion blur, encode H.264 via ffmpeg-static.
 * Whoosh SFX at 8.66s and 9.80s.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const FRAMES = path.join(ROOT, "frames");
const OUT = path.join(ROOT, "out");
const PORT = 8767;
// Capture at 30fps with light motion blur, then optical-flow to 60fps (plan preview approach).
const CAPTURE_FPS = 30;
const OUTPUT_FPS = 60;
const DURATION = 14.5;
const TOTAL_FRAMES = Math.round(DURATION * CAPTURE_FPS); // 435
const SUBFRAMES = 2;
const W = 1440;
const H = 1152;

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
    const filePath = path.join(ROOT, urlPath === "/" ? "scene/index.html" : urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function averagePngBuffers(buffers) {
  const pngs = buffers.map((b) => PNG.sync.read(b));
  const { width, height } = pngs[0];
  const out = new PNG({ width, height });
  const n = pngs.length;
  for (let i = 0; i < width * height * 4; i += 4) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    for (const p of pngs) {
      r += p.data[i];
      g += p.data[i + 1];
      b += p.data[i + 2];
      a += p.data[i + 3];
    }
    out.data[i] = Math.round(r / n);
    out.data[i + 1] = Math.round(g / n);
    out.data[i + 2] = Math.round(b / n);
    out.data[i + 3] = Math.round(a / n);
  }
  return PNG.sync.write(out);
}

async function generateWhooshes() {
  const whooshDir = path.join(OUT, "sfx");
  await fsp.mkdir(whooshDir, { recursive: true });
  const w1 = path.join(whooshDir, "whoosh1.wav");
  const w2 = path.join(whooshDir, "whoosh2.wav");
  // Soft band noise bursts
  await run(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anoisesrc=color=pink:duration=0.35:sample_rate=44100",
    "-af",
    "afade=t=in:st=0:d=0.05,afade=t=out:st=0.2:d=0.15,volume=0.25",
    w1,
  ]);
  await run(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anoisesrc=color=pink:duration=0.28:sample_rate=44100",
    "-af",
    "afade=t=in:st=0:d=0.04,afade=t=out:st=0.15:d=0.13,volume=0.22",
    w2,
  ]);
  return { w1, w2 };
}

async function main() {
  await fsp.rm(FRAMES, { recursive: true, force: true });
  await fsp.mkdir(FRAMES, { recursive: true });
  await fsp.mkdir(OUT, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });

  await page.goto(`http://127.0.0.1:${PORT}/scene/index.html`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(() => window.__fly?.ready === true, null, { timeout: 120000 });
  await page.waitForTimeout(400);

  console.log(`Rendering ${TOTAL_FRAMES} frames @ ${CAPTURE_FPS}fps × ${SUBFRAMES} subframes…`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t0 = i / CAPTURE_FPS;
    const t1 = (i + 1) / CAPTURE_FPS;
    const buffers = [];

    for (let s = 0; s < SUBFRAMES; s++) {
      const t = t0 + ((s + 0.5) / SUBFRAMES) * (t1 - t0);
      await page.evaluate((time) => window.__fly.setTime(time), t);
      const buf = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: W, height: H },
      });
      buffers.push(buf);
    }

    const blended = averagePngBuffers(buffers);
    const name = `frame-${String(i).padStart(5, "0")}.png`;
    await fsp.writeFile(path.join(FRAMES, name), blended);

    if (i % 30 === 0 || i === TOTAL_FRAMES - 1) {
      console.log(`frame ${i + 1}/${TOTAL_FRAMES} (t=${t0.toFixed(2)}s)`);
    }
  }

  await browser.close();
  server.close();

  const { w1, w2 } = await generateWhooshes();
  const mp4 = path.join(OUT, "flythrough.mp4");

  // Prefer nvenc if available; fall back to libx264
  const filterComplex =
    `[0:v]minterpolate=fps=${OUTPUT_FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1[v];` +
    `[1]adelay=8660|8660[a1];[2]adelay=9800|9800[a2];` +
    `[a1][a2]amix=inputs=2:duration=longest:dropout_transition=0,apad=whole_dur=${DURATION}[aout]`;

  const videoArgsBase = [
    "-y",
    "-framerate",
    String(CAPTURE_FPS),
    "-i",
    path.join(FRAMES, "frame-%05d.png"),
    "-i",
    w1,
    "-i",
    w2,
    "-filter_complex",
    filterComplex,
    "-map",
    "[v]",
    "-map",
    "[aout]",
    "-t",
    String(DURATION),
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
  ];

  async function encode(vCodecArgs, label) {
    await run(ffmpegPath, [...videoArgsBase, ...vCodecArgs, mp4]);
    console.log(label);
  }

  try {
    await encode(["-c:v", "h264_nvenc", "-preset", "p4", "-b:v", "12M"], "Encoded with h264_nvenc @ 60fps (optical flow)");
  } catch {
    try {
      await encode(["-c:v", "libx264", "-preset", "medium", "-crf", "18"], "Encoded with libx264 @ 60fps (optical flow)");
    } catch {
      // Fallback without MCI if minterpolate is too heavy
      const simple = [
        "-y",
        "-framerate",
        String(CAPTURE_FPS),
        "-i",
        path.join(FRAMES, "frame-%05d.png"),
        "-i",
        w1,
        "-i",
        w2,
        "-filter_complex",
        `[0:v]fps=${OUTPUT_FPS}[v];[1]adelay=8660|8660[a1];[2]adelay=9800|9800[a2];[a1][a2]amix=inputs=2:duration=longest,apad=whole_dur=${DURATION}[aout]`,
        "-map",
        "[v]",
        "-map",
        "[aout]",
        "-t",
        String(DURATION),
        "-c:v",
        "libx264",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        mp4,
      ];
      await run(ffmpegPath, simple);
      console.log("Encoded with libx264 @ 60fps (frame duplicate fallback)");
    }
  }

  console.log("Done →", mp4);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
