"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = { dir: "/seq", count: 303 };
const MOBILE = { dir: "/seq-sm", count: 242 };

/** /seq/f_007.avif — frames are 1-indexed and zero-padded to three digits. */
const frameSrc = (dir: string, i: number) =>
  `${dir}/f_${String(i + 1).padStart(3, "0")}.avif`;

/**
 * The hero centrepiece. A frame sequence drawn to a canvas and scrubbed
 * against the scroll position, so the camera move is driven entirely by
 * the scrollbar.
 *
 * The source clip only carries 21 keyframes across 606 frames, so seeking a
 * <video> would snap in ~1s jumps. Decoding stills into a canvas is what
 * makes every scroll position land on its own frame.
 */
export default function ScrollSequence({
  triggerRef,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d", { alpha: false });
    if (!ctx2d) return;

    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = "high";

    const set = window.matchMedia("(max-width: 767px)").matches
      ? MOBILE
      : DESKTOP;

    const frames: (ImageBitmap | HTMLImageElement | null)[] = new Array(
      set.count,
    ).fill(null);
    let disposed = false;
    let lastDrawn = -1;
    let loaded = 0;

    /** Cover-fit: fill the canvas, crop the overflow, never distort. */
    const paint = (img: ImageBitmap | HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const drawIndex = (i: number) => {
      const clamped = Math.min(set.count - 1, Math.max(0, i));
      if (clamped === lastDrawn) return; // redrawing the same frame is wasted GPU
      const img = frames[clamped];
      if (!img) return;
      lastDrawn = clamped;
      paint(img);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      // Resizing the backing store resets context state, so restore it.
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = "high";
      const current = lastDrawn;
      lastDrawn = -1; // force a repaint at the new size
      drawIndex(current < 0 ? 0 : current);
    };

    // Load frame 0 first so something is on screen immediately, then the rest.
    /**
     * Decode straight to an ImageBitmap at roughly the size we will draw it.
     * Keeping 300 full-resolution bitmaps resident exhausts the browser's
     * image-memory budget and decoding silently stops partway through.
     */
    const decodeWidth = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(window.innerWidth * dpr);
      return Math.min(w, 1600);
    };

    const loadFrame = async (i: number) => {
      try {
        const res = await fetch(frameSrc(set.dir, i));
        const blob = await res.blob();
        const target = decodeWidth();
        frames[i] = await createImageBitmap(blob, {
          resizeWidth: target,
          resizeQuality: "high",
        });
      } catch {
        // A dropped frame just means the scrub holds the previous one.
      }
      loaded += 1;
      if (!disposed) setProgress(loaded / set.count);
    };

    let st: ScrollTrigger | null = null;

    const boot = async () => {
      await loadFrame(0);
      if (disposed) return;
      resize();
      drawIndex(0);
      setReady(true);

      // Remaining frames, batched so the network isn't hit with 300 at once.
      const BATCH = 12;
      for (let start = 1; start < set.count; start += BATCH) {
        if (disposed) return;
        await Promise.all(
          Array.from({ length: Math.min(BATCH, set.count - start) }, (_, k) =>
            loadFrame(start + k),
          ),
        );
      }
    };

    void boot();

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { reduced } = context.conditions as {
          motion: boolean;
          reduced: boolean;
        };

        // Reduced motion: hold the opening frame, no pin, no scrub.
        if (reduced) return;

        const proxy = { f: 0 };

        st = ScrollTrigger.create({
          trigger: triggerRef.current,
          start: "top top",
          end: "+=320%",
          scrub: 1, // the lag is what gives the move its weight
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            proxy.f = self.progress * (set.count - 1);
            drawIndex(Math.round(proxy.f));
          },
        });
      },
    );

    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      st?.kill();
      mm.revert();
      frames.forEach((f) => {
        if (f && "close" in f) f.close();
      });
      frames.fill(null);
    };
  }, [triggerRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full bg-ink"
      />
      {/* Quiet load indicator — a thin rule, not a spinner. */}
      {!ready && (
        <div className="absolute inset-x-0 bottom-0 z-40 h-px bg-ink/10">
          <div
            className="h-full bg-accent transition-[width] duration-200"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
      <span className="sr-only">
        A bronze sculpture of Lady Justice holding the scales, filmed in a
        darkened chamber as the camera moves past her towards the city beyond.
      </span>
    </>
  );
}
