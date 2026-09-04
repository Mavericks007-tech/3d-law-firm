"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitWords } from "@/lib/splitWords";

gsap.registerPlugin(ScrollTrigger);

const COPY =
  "A legal problem is rarely only a legal problem. It sits on top of a business you built, a family you are trying to hold together, or a reputation you have spent years earning. We take the whole of it seriously.";

export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hl]", { color: "var(--color-ink)" });
      });

      // 5.3 — scrubbed both directions, muted fills to ink word by word
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-hl]",
          { color: "var(--color-muted)" },
          {
            color: "var(--color-ink)",
            ease: "none",
            stagger: { each: 0.02 },
            scrollTrigger: {
              trigger: root.current,
              start: "top 78%",
              end: "top 32%",
              scrub: true,
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="about"
      className="mx-auto max-w-[1400px] px-4 py-28 md:px-8 md:py-40"
    >
      <p className="mx-auto max-w-[55ch] text-center font-display text-[1.6rem] leading-[1.35] font-medium tracking-tight md:text-[2.1rem]">
        {splitWords(COPY).map((chunk, i) =>
          chunk.trim() === "" ? (
            <span key={i} className="word">
              {chunk}
            </span>
          ) : (
            <span key={i} data-hl className="word text-muted">
              {chunk}
            </span>
          ),
        )}
      </p>
    </section>
  );
}
