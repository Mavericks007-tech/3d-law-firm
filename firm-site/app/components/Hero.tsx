"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitWords } from "@/lib/splitWords";
import ScrollSequence from "./ScrollSequence";
import HeroPanels from "./HeroPanels";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = "Your legal partner in every situation";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { motion, reduced } = context.conditions as {
            motion: boolean;
            reduced: boolean;
          };

          if (reduced) {
            gsap.set("[data-word], [data-sub], [data-cta]", {
              opacity: 1,
              y: 0,
              filter: "none",
            });
            return;
          }

          if (!motion) return;

          // 5.1 — one orchestrated load sequence, under 1.4s.
          // The footage deliberately sits this out; it enters on scroll only.
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          tl.fromTo(
            "[data-word]",
            { y: 24, opacity: 0, filter: "blur(6px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.7,
              stagger: 0.045,
            },
            0.1,
          )
            .fromTo(
              "[data-sub]",
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5 },
              0.45,
            )
            .fromTo(
              "[data-cta]",
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5 },
              0.58,
            );

          // The copy hands off early: by the time the camera reaches the
          // skyline there is no scrim left to keep it legible.
          // Clears before the first step panel lands at 26% of the pin, so
          // the two never occupy the centre of the frame together.
          const out = gsap.to("[data-copy]", {
            opacity: 0,
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=72%",
              scrub: 1,
            },
          });

          return () => {
            tl.kill();
            out.scrollTrigger?.kill();
            out.kill();
          };
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="home"
      className="relative h-[100dvh] overflow-hidden bg-ink"
    >
      <ScrollSequence triggerRef={root} />

      {/* Scrim — a gradient, not a flat wash, so the footage stays readable
          underneath the type. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 bg-gradient-to-b from-ink/80 via-ink/15 to-ink/70"
      />

      <HeroPanels triggerRef={root} />

      <div data-copy className="relative z-30 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1400px] px-4 text-center md:px-8">
          <h1 className="mx-auto max-w-[16ch] text-base">
            {splitWords(HEADLINE).map((chunk, i) =>
              chunk.trim() === "" ? (
                <span key={i} className="word">
                  {chunk}
                </span>
              ) : (
                <span key={i} data-word className="word">
                  {chunk}
                </span>
              ),
            )}
          </h1>

          <p
            data-sub
            className="mx-auto mt-6 max-w-[46ch] text-balance text-base/90"
          >
            Call us and you speak to the solicitor handling your file. We quote
            the cost in writing before any work begins.
          </p>

          <div data-cta className="mt-8">
            <a
              href="#contact"
              className="inline-block rounded-pill bg-base px-7 py-3.5 text-[0.95rem] text-ink transition-colors duration-300 hover:bg-surface"
            >
              Book a consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
