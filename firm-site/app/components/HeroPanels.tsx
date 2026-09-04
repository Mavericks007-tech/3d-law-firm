"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Three moments told over the pinned hero while the camera moves.
 *
 * No panels, no cards, no tinted backgrounds: the footage is the surface and
 * the type sits directly on it. Each moment gets its own composition so the
 * three do not read as one template repeated, and each owns a slice of the
 * pin's 0..1 progress.
 */
const MOMENTS = [
  {
    key: "call",
    kicker: "01",
    lead: "First",
    title: "a free\ntwenty-minute call",
    body: "Tell us what has happened. We tell you where you stand, and whether you need a solicitor at all.",
    cta: "Book the call",
    href: "#contact",
    layout: "left" as const,
    in: 0.24,
    out: 0.45,
  },
  {
    key: "plan",
    kicker: "02",
    lead: "Then",
    title: "a written plan,\na fixed fee",
    body: "The steps, the timescale and one agreed price, in writing. Nothing starts until you say yes.",
    cta: "See how we work",
    href: "#about",
    layout: "centre" as const,
    in: 0.47,
    out: 0.68,
  },
  {
    key: "handle",
    kicker: "03",
    lead: "After that",
    title: "we handle it",
    body: "Your solicitor runs the matter and updates you at every stage, always within one working day.",
    cta: "Talk to a solicitor",
    href: "#contact",
    layout: "right" as const,
    in: 0.7,
    out: 0.95,
  },
];

/** Wrap each word so the headline can rise line by line. */
function Title({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <span key={li} className="block overflow-hidden pb-[0.08em]">
          <span data-line className="block">
            {line}
          </span>
        </span>
      ))}
    </>
  );
}

export default function HeroPanels({
  triggerRef,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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

          const groups = gsap.utils.toArray<HTMLElement>("[data-moment]");

          if (reduced) {
            groups.forEach((g) => {
              g.classList.remove("panel-hidden");
              gsap.set(g, { opacity: 1, position: "relative" });
              gsap.set(g.querySelectorAll("[data-line], [data-fade]"), {
                opacity: 1,
                yPercent: 0,
              });
            });
            gsap.set(root.current, { position: "relative", height: "auto" });
            return;
          }

          // One timeline of duration 1 so the fractions above map straight
          // onto the pin's scroll progress.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: triggerRef.current,
              start: "top top",
              end: "+=320%",
              scrub: 1,
            },
          });
          tl.to({}, { duration: 1 }, 0);

          groups.forEach((group, i) => {
            const cfg = MOMENTS[i];
            const span = cfg.out - cfg.in;
            const enter = span * 0.3;
            const exit = span * 0.24;

            const kicker = group.querySelector("[data-kicker]");
            const rule = group.querySelector("[data-rule]");
            const lines = group.querySelectorAll("[data-line]");
            const fades = group.querySelectorAll("[data-fade]");

            // Hand visibility to GSAP: drop the CSS pre-hydration class and
            // start hidden, so only the live moment is ever on screen.
            group.classList.remove("panel-hidden");
            gsap.set(group, { autoAlpha: 0 });

            tl.set(group, { autoAlpha: 1 }, cfg.in)
              // kicker and rule draw first
              .fromTo(
                kicker,
                { opacity: 0, yPercent: 60 },
                { opacity: 1, yPercent: 0, ease: "power3.out", duration: enter * 0.4 },
                cfg.in,
              )
              .fromTo(
                rule,
                { scaleX: 0 },
                { scaleX: 1, ease: "power2.out", duration: enter * 0.7 },
                cfg.in + enter * 0.1,
              )
              // headline rises line by line out of its mask
              .fromTo(
                lines,
                { yPercent: 115 },
                {
                  yPercent: 0,
                  ease: "power4.out",
                  duration: enter,
                  stagger: enter * 0.18,
                },
                cfg.in + enter * 0.15,
              )
              // body and CTA follow
              .fromTo(
                fades,
                { opacity: 0, y: 18 },
                {
                  opacity: 1,
                  y: 0,
                  ease: "power3.out",
                  duration: enter * 0.8,
                  stagger: enter * 0.16,
                },
                cfg.in + enter * 0.5,
              )
              // whole group drifts and clears
              .to(
                group,
                {
                  opacity: 0,
                  yPercent: -4,
                  ease: "power2.in",
                  duration: exit,
                },
                cfg.out - exit,
              )
              .set(group, { autoAlpha: 0 }, cfg.out);
          });
        },
      );
    }, root);

    return () => ctx.revert();
  }, [triggerRef]);

  const scrim = {
    left: "bg-[linear-gradient(90deg,var(--color-ink)_0%,color-mix(in_oklab,var(--color-ink)_72%,transparent)_38%,transparent_78%)]",
    centre:
      "bg-[radial-gradient(ellipse_78%_62%_at_50%_50%,color-mix(in_oklab,var(--color-ink)_78%,transparent)_0%,color-mix(in_oklab,var(--color-ink)_45%,transparent)_55%,transparent_100%)]",
    right:
      "bg-[linear-gradient(270deg,var(--color-ink)_0%,color-mix(in_oklab,var(--color-ink)_72%,transparent)_38%,transparent_78%)]",
  };

  return (
    <div ref={root} className="hero-panels pointer-events-none absolute inset-0">
      {MOMENTS.map((m) => (
        <div
          key={m.key}
          data-moment
          className={[
            "panel-hidden absolute inset-0 flex items-center px-6 md:px-16 lg:px-24",
            m.layout === "left" ? "justify-start text-left" : "",
            m.layout === "centre" ? "justify-center text-center" : "",
            m.layout === "right" ? "justify-end text-left md:text-right" : "",
          ].join(" ")}
        >
          {/* Scrim follows the composition: dense under the type, clear on the
              opposite side so the camera move still reads. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${scrim[m.layout]}`}
          />

          <div
            className={[
              "relative w-full",
              m.layout === "centre" ? "max-w-[54rem]" : "max-w-[42rem]",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center gap-4",
                m.layout === "centre" ? "justify-center" : "",
                m.layout === "right" ? "md:justify-end" : "",
              ].join(" ")}
            >
              <span
                data-kicker
                className="font-display text-[0.8rem] tracking-[0.3em] text-base/60 tabular-nums"
              >
                {m.kicker}
              </span>
              <span
                data-rule
                aria-hidden="true"
                className={[
                  "h-px w-16 origin-left bg-base/35",
                  m.layout === "right" ? "md:origin-right" : "",
                ].join(" ")}
              />
              <span className="text-[0.8rem] tracking-[0.02em] text-base/60">
                {m.lead}
              </span>
            </div>

            <h3 className="mt-7 font-display text-[2.6rem] leading-[1.02] font-medium tracking-[-0.03em] text-base text-balance md:text-[4.2rem] lg:text-[5rem]">
              <Title text={m.title} />
            </h3>

            <p
              data-fade
              className={[
                "mt-7 max-w-[38ch] text-[1.05rem] leading-relaxed text-base/85 md:text-[1.2rem]",
                m.layout === "centre" ? "mx-auto" : "",
                m.layout === "right" ? "md:ml-auto" : "",
              ].join(" ")}
            >
              {m.body}
            </p>

            <div
              data-fade
              className={[
                "mt-10 flex",
                m.layout === "centre" ? "justify-center" : "",
                m.layout === "right" ? "md:justify-end" : "",
              ].join(" ")}
            >
              <a
                href={m.href}
                className="pointer-events-auto group inline-flex items-center gap-3 border-b border-base/30 pb-2 font-display text-[1.05rem] tracking-tight text-base transition-colors duration-300 hover:border-base md:text-[1.15rem]"
              >
                {m.cta}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
