// Packs the raw per-frame PNGs from .flythrough-raw/<tier>/ into a handful
// of sprite-atlas WebP images plus a manifest.json per tier, so the landing
// page loads a few large files instead of dozens of tiny ones.
import sharp from "sharp";
import { readdir, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DESKTOP, MOBILE } from "./flythrough-tiers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_ROOT = path.join(__dirname, "..", ".flythrough-raw");
const OUT_ROOT = path.join(__dirname, "..", "public", "flythrough");

const TIERS = [
  { ...MOBILE, framesPerAtlas: 45, quality: 82 },
  { ...DESKTOP, framesPerAtlas: 45, quality: 88 },
];

function gridFor(count) {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

// The Gemini/Veo watermark (a small sparkle glyph) is burned into a fixed
// spot near the bottom-right corner of every frame. Coordinates below were
// measured on the 1280x720 source and scale linearly to other tiers.
// Rather than paint a flat box over it (a visible dark patch against the
// starfield), a same-size patch is cloned from the clean sky further up the
// same column and feathered in with a radial alpha mask so it blends into
// the background noise.
const WATERMARK_BOX = { x: 1112, y: 548, w: 100, h: 112 }; // in 1280x720 space
const WATERMARK_PATCH_SRC_Y = 20; // clean sky region to clone from

async function patchWatermark(buffer, tierWidth, tierHeight) {
  const scale = tierWidth / 1280;
  const boxX = Math.round(WATERMARK_BOX.x * scale);
  const boxY = Math.round(WATERMARK_BOX.y * scale);
  const boxW = Math.round(WATERMARK_BOX.w * scale);
  const boxH = Math.round(WATERMARK_BOX.h * scale);
  const srcY = Math.round(WATERMARK_PATCH_SRC_Y * scale);

  const patch = await sharp(buffer)
    .extract({ left: boxX, top: srcY, width: boxW, height: boxH })
    .toBuffer();

  const maskSvg = `<svg width="${boxW}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="55%">
        <stop offset="50%" stop-color="#fff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${boxW}" height="${boxH}" fill="url(#g)"/>
  </svg>`;
  const mask = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  const softPatch = await sharp(patch)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return sharp(buffer)
    .composite([{ input: softPatch, left: boxX, top: boxY }])
    .toBuffer();
}

async function buildTier(tier) {
  const rawDir = path.join(RAW_ROOT, tier.name);
  const files = (await readdir(rawDir)).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) throw new Error(`No raw frames found for tier "${tier.name}" in ${rawDir}`);

  const outDir = path.join(OUT_ROOT, tier.name);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const chunks = [];
  for (let i = 0; i < files.length; i += tier.framesPerAtlas) {
    chunks.push(files.slice(i, i + tier.framesPerAtlas));
  }

  const { cols, rows } = gridFor(tier.framesPerAtlas);
  const atlasNames = [];

  for (let a = 0; a < chunks.length; a++) {
    const chunk = chunks[a];
    const composite = await Promise.all(
      chunk.map(async (file, idx) => {
        const raw = await sharp(path.join(rawDir, file)).toBuffer();
        const patched = await patchWatermark(raw, tier.width, tier.height);
        return {
          input: patched,
          left: (idx % cols) * tier.width,
          top: Math.floor(idx / cols) * tier.height,
        };
      })
    );

    const atlasName = `atlas-${a}.webp`;
    await sharp({
      create: {
        width: cols * tier.width,
        height: rows * tier.height,
        channels: 4,
        background: { r: 12, g: 10, b: 8, alpha: 1 },
      },
    })
      .composite(composite)
      .webp({ quality: tier.quality })
      .toFile(path.join(outDir, atlasName));

    atlasNames.push(atlasName);
    console.log(`${tier.name}: wrote ${atlasName} (${chunk.length} frames)`);
  }

  // Poster = first frame, generously compressed, shown before atlases load.
  const posterRaw = await sharp(path.join(rawDir, files[0])).toBuffer();
  const posterPatched = await patchWatermark(posterRaw, tier.width, tier.height);
  await sharp(posterPatched).webp({ quality: 78 }).toFile(path.join(outDir, "poster.webp"));

  const manifest = {
    frameWidth: tier.width,
    frameHeight: tier.height,
    cols,
    rows,
    framesPerAtlas: tier.framesPerAtlas,
    totalFrames: files.length,
    atlases: atlasNames,
    poster: "poster.webp",
  };
  await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`${tier.name}: manifest.json written (${files.length} frames total)`);
}

async function main() {
  for (const tier of TIERS) {
    await buildTier(tier);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
