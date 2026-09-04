// Extracts a still-frame PNG sequence from the AI-generated flythrough video
// (.flythrough-source/video.mp4), using a real headless Chromium <video> +
// requestVideoFrameCallback instead of ffmpeg (not installed on this
// machine). Headless Chromium's `video.currentTime = t` seek is a no-op in
// this environment (confirmed: currentTime stayed 0 after every seek
// attempt), so instead the video is played through once in real time and
// frames are grabbed as playback crosses each target timestamp — forward
// playback does advance currentTime normally.
//
// Frames are captured once at the desktop resolution/frame-count; the
// mobile tier is derived by subsampling + downscaling afterwards, so the
// video only has to be played through a single time.
import { chromium } from "playwright";
import { mkdir, rm, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { DESKTOP, MOBILE } from "./flythrough-tiers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_PATH = path.join(__dirname, "..", ".flythrough-source", "video.mp4");
const OUT_ROOT = path.join(__dirname, "..", ".flythrough-raw");

const HTML = `<!doctype html>
<html><body style="margin:0;background:#000">
<video id="v" src="/video.mp4" muted playsinline></video>
<canvas id="c" width="${DESKTOP.width}" height="${DESKTOP.height}"></canvas>
</body></html>`;

async function startVideoServer() {
  const { size } = await stat(VIDEO_PATH);
  const buffer = await readFile(VIDEO_PATH);
  const server = createServer((req, res) => {
    if (req.url === "/video.mp4") {
      res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": size });
      res.end(buffer);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(HTML);
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}/` };
}

async function main() {
  await rm(OUT_ROOT, { recursive: true, force: true });
  const desktopDir = path.join(OUT_ROOT, DESKTOP.name);
  await mkdir(desktopDir, { recursive: true });

  const { server, url } = await startVideoServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(45000);

    await page.exposeFunction("__saveFrame", async (index, base64) => {
      const file = path.join(desktopDir, `frame-${String(index).padStart(3, "0")}.png`);
      await writeFile(file, Buffer.from(base64, "base64"));
      process.stdout.write(`\rcaptured ${index + 1}/${DESKTOP.frames}`);
    });

    await page.goto(url);
    await page.waitForFunction(() => document.getElementById("v").readyState >= 1, null, {
      timeout: 30000,
    });
    const duration = await page.evaluate(() => document.getElementById("v").duration);
    console.log(`Source video duration: ${duration.toFixed(3)}s`);

    // The last decoded frame's mediaTime is always slightly less than the
    // reported duration, so a target of exactly `duration` never gets
    // crossed and the capture loop hangs forever waiting for it. Clamp the
    // window short of the end.
    const safeDuration = duration - 0.15;
    const targets = Array.from({ length: DESKTOP.frames }, (_, i) =>
      DESKTOP.frames === 1 ? 0 : (i / (DESKTOP.frames - 1)) * safeDuration
    );

    await page.evaluate(
      ({ targets, width, height }) => {
        return Promise.race([
          new Promise((resolve) => setTimeout(resolve, 30000)),
          new Promise((resolve) => {
          const v = document.getElementById("v");
          const c = document.getElementById("c");
          const ctx = c.getContext("2d");
          let nextTarget = 0;

          const flushRemaining = () => {
            while (nextTarget < targets.length) {
              ctx.drawImage(v, 0, 0, width, height);
              const dataUrl = c.toDataURL("image/png");
              window.__saveFrame(nextTarget, dataUrl.slice(dataUrl.indexOf(",") + 1));
              nextTarget++;
            }
          };

          // Safety net: if playback ends before every target is crossed
          // (clock drift, a target past the last decoded frame), fill the
          // rest from the final frame instead of hanging forever.
          v.onended = () => {
            flushRemaining();
            resolve();
          };

          const onFrame = (_now, metadata) => {
            while (nextTarget < targets.length && metadata.mediaTime >= targets[nextTarget]) {
              ctx.drawImage(v, 0, 0, width, height);
              const dataUrl = c.toDataURL("image/png");
              window.__saveFrame(nextTarget, dataUrl.slice(dataUrl.indexOf(",") + 1));
              nextTarget++;
            }
            if (nextTarget >= targets.length) {
              v.pause();
              resolve();
              return;
            }
            v.requestVideoFrameCallback(onFrame);
          };

          v.requestVideoFrameCallback(onFrame);
          v.play();
          }),
        ]);
      },
      { targets, width: DESKTOP.width, height: DESKTOP.height }
    );
    process.stdout.write("\n");

    await page.close();
  } finally {
    await browser.close();
    server.close();
  }

  console.log("Deriving mobile tier from captured desktop frames...");
  const mobileDir = path.join(OUT_ROOT, MOBILE.name);
  await mkdir(mobileDir, { recursive: true });
  const stride = (DESKTOP.frames - 1) / (MOBILE.frames - 1);
  for (let i = 0; i < MOBILE.frames; i++) {
    const srcIndex = Math.round(i * stride);
    const src = path.join(desktopDir, `frame-${String(srcIndex).padStart(3, "0")}.png`);
    const dest = path.join(mobileDir, `frame-${String(i).padStart(3, "0")}.png`);
    await sharp(src).resize(MOBILE.width, MOBILE.height).toFile(dest);
  }

  console.log(`Raw frames written to ${OUT_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
