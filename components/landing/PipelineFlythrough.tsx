"use client";

// Scroll-scrubbed frame-sequence player for the pipeline flythrough. The 3D
// scene itself (components/landing/flythrough-scene.tsx) is rendered offline
// by scripts/capture-flythrough-frames.mjs into sprite atlases under
// public/flythrough/{mobile,desktop}/ — this component never imports
// three.js, so it ships zero 3D-library weight to real visitors. A canvas
// image sequence (rather than a <video>) was chosen deliberately: iOS Safari
// stutters badly when seeking video.currentTime rapidly during scroll, while
// drawImage from a preloaded atlas is exact and jank-free everywhere.
import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, useTransform, motion } from "framer-motion";
import { STAGES, type Stage } from "./flythrough-stages";

interface Manifest {
  frameWidth: number;
  frameHeight: number;
  cols: number;
  rows: number;
  framesPerAtlas: number;
  totalFrames: number;
  atlases: string[];
  poster: string;
}

type Tier = "mobile" | "desktop";

function pickTier(): Tier {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function isSlowConnection(): boolean {
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType ? ["slow-2g", "2g", "3g"].includes(conn.effectiveType) : false;
}

export function PipelineFlythrough() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tier, setTier] = useState<Tier | null>(null);
  const [skipHeavy, setSkipHeavy] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const manifestRef = useRef<Manifest | null>(null);
  const atlasImagesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setTier(pickTier());
    setSkipHeavy(isSlowConnection());
  }, []);

  useEffect(() => {
    if (tier) setPosterUrl(`/flythrough/${tier}/poster.webp`);
  }, [tier]);

  const draw = () => {
    const canvas = canvasRef.current;
    const manifest = manifestRef.current;
    const images = atlasImagesRef.current;
    if (!canvas || !manifest || images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameIndex = Math.min(
      manifest.totalFrames - 1,
      Math.max(0, Math.round(progressRef.current * (manifest.totalFrames - 1)))
    );
    const localIndex = frameIndex % manifest.framesPerAtlas;
    const img = images[Math.floor(frameIndex / manifest.framesPerAtlas)];
    if (!img) return;

    ctx.drawImage(
      img,
      (localIndex % manifest.cols) * manifest.frameWidth,
      Math.floor(localIndex / manifest.cols) * manifest.frameHeight,
      manifest.frameWidth,
      manifest.frameHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  // Defer loading the (heavier) atlas set until the section is close to the
  // viewport, and skip it entirely on slow/data-saver connections — those
  // visitors still get the poster frame and the scroll-driven captions.
  useEffect(() => {
    if (!tier || skipHeavy || !wrapperRef.current) return;
    let cancelled = false;

    const load = async () => {
      const res = await fetch(`/flythrough/${tier}/manifest.json`);
      if (!res.ok || cancelled) return;
      const manifest: Manifest = await res.json();
      const images = await Promise.all(
        manifest.atlases.map(
          (name) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = `/flythrough/${tier}/${name}`;
            })
        )
      );
      if (cancelled) return;
      manifestRef.current = manifest;
      atlasImagesRef.current = images;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = manifest.frameWidth;
        canvas.height = manifest.frameHeight;
      }
      setReady(true);
    };

    const el = wrapperRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          load().catch(() => {});
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [tier, skipHeavy]);

  useEffect(() => {
    if (ready) draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    if (ready) draw();
  });

  const n = STAGES.length;

  return (
    <section ref={containerRef} className="relative" style={{ height: `${(n + 1) * 100}vh` }}>
      <div ref={wrapperRef} className="sticky top-0 h-screen w-full overflow-hidden bg-bg">
        {posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: ready ? 0 : 1 }}
          />
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        />

        {STAGES.map((stage, i) => (
          <StageCaption key={stage.label} stage={stage} index={i} scrollYProgress={scrollYProgress} />
        ))}

        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
            Прокрути, чтобы пролететь сквозь пайплайн
          </span>
        </div>
      </div>
    </section>
  );
}

function StageCaption({
  stage,
  index,
  scrollYProgress,
}: {
  stage: Stage;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Centered on the object's actual on-screen peak in the source video
  // (stage.center), not an even 1/n split — see flythrough-stages.ts.
  const HALF_WIDTH = 0.09;
  const mid = stage.center;
  const start = Math.max(0, mid - HALF_WIDTH);
  const end = Math.min(1, mid + HALF_WIDTH);

  const opacity = useTransform(scrollYProgress, [start, mid, end], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [start, mid, end], [24, 0, -24]);

  const align = index % 2 === 0 ? "items-start text-left left-8 md:left-16" : "items-end text-right right-8 md:right-16";

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute bottom-20 md:bottom-1/3 flex flex-col ${align} pointer-events-none max-w-xs`}
    >
      <span
        className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-sm border mb-2"
        style={{ color: stage.color, borderColor: stage.color + "60", background: stage.color + "1a" }}
      >
        {stage.category}
      </span>
      <h3 className="font-mono text-2xl md:text-3xl text-text-primary mb-1">{stage.label}</h3>
      <p className="text-sm text-text-secondary">{stage.sub}</p>
    </motion.div>
  );
}
