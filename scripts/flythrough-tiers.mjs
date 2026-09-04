// Single source of truth for output resolution/frame-count per device tier,
// shared by extract-video-frames.mjs (capture) and build-flythrough-atlas.mjs
// (packing) — they drifted out of sync once before, corrupting the atlas
// grid, so don't duplicate these numbers again.
export const DESKTOP = { name: "desktop", width: 1920, height: 1080, frames: 90 };
export const MOBILE = { name: "mobile", width: 828, height: 466, frames: 45 };
