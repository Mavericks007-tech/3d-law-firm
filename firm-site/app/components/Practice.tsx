"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AREAS = [
  "Corporate & business",
  "Intellectual property",
  "Family & divorce",
  "Criminal defence",
  "Estate planning",
];

export default function Practice() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const pills = gsap.utils.toArray<HTMLElement>("[data-pill]");

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pills, { y: 0, opacity: 1 });
      });

      // 5.6 — land on stagger, then drift independently so they never pulse in sync
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          pills,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: root.current,
              start: "top 70%",
              once: true,
            },
            onComplete: () => {
              pills.forEach((pill) => {
                gsap.to(pill, {
                  y: gsap.utils.random(-5, 5),
                  duration: gsap.utils.random(4, 6),
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                  delay: gsap.utils.random(0, 1.5),
                });
              });
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="services" className="pt-32 md:pt-40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 className="max-w-[18ch]">What we handle</h2>
        <p className="mt-5 max-w-[62ch] text-ink/80">
          Five practice areas, each led by a solicitor who works in it full
          time. If your matter falls outside them we will say so on the first
          call and point you somewhere better.
        </p>
      </div>

      <div className="relative mt-14 md:mt-20">
        <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
          {/* A still from the hero footage — the chambers at night. Swap for a
              commissioned photograph of the real office when one exists. */}
          <Image
            src="/chambers.avif"
            alt="The chambers at night, looking out over the city"
            fill
            sizes="100vw"
            className="object-cover object-[50%_45%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-base/30" />
        </div>

        <ul className="absolute inset-x-0 bottom-8 flex flex-wrap justify-center gap-3 px-4 md:bottom-12 md:px-8">
          {AREAS.map((area) => (
            <li key={area} data-pill>
              <a
                href="#contact"
                className="block rounded-pill bg-base/90 px-5 py-2.5 text-[0.9rem] text-ink backdrop-blur-md transition-colors duration-300 hover:bg-base"
              >
                {area}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
