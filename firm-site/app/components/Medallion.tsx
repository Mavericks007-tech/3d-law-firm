"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

// Fixed precision: raw float output differs between the server and the
// client renderer, which trips a hydration mismatch on the tick marks.
const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Isolated so the perpetual rotation never re-renders the stats bar.
 * Only the engraved outer ring turns; the scales glyph stays upright.
 */
function Medallion() {
  const ring = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // 5.5 — 360 over 26s, linear, infinite
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(ring.current, {
          rotate: 360,
          duration: 26,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex size-[76px] items-center justify-center rounded-pill bg-accent md:size-[92px]">
      <svg
        viewBox="0 0 100 100"
        className="size-full"
        aria-hidden="true"
        focusable="false"
      >
        <g ref={ring} stroke="var(--color-base)" fill="none" strokeWidth="1">
          <circle cx="50" cy="50" r="40" opacity="0.45" />
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const inner = i % 3 === 0 ? 33 : 36;
            return (
              <line
                key={i}
                x1={round(50 + inner * Math.cos(angle))}
                y1={round(50 + inner * Math.sin(angle))}
                x2={round(50 + 40 * Math.cos(angle))}
                y2={round(50 + 40 * Math.sin(angle))}
                opacity={i % 3 === 0 ? 0.7 : 0.3}
              />
            );
          })}
        </g>

        {/* Scales glyph — static, never rotates */}
        <g
          stroke="var(--color-base)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <line x1="50" y1="30" x2="50" y2="66" />
          <line x1="32" y1="38" x2="68" y2="38" />
          <line x1="40" y1="66" x2="60" y2="66" />
          <path d="M32 38 L25 52 h14 Z" />
          <path d="M68 38 L61 52 h14 Z" />
        </g>
      </svg>
    </div>
  );
}

export default memo(Medallion);
