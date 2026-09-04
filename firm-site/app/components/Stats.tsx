"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Medallion from "./Medallion";

gsap.registerPlugin(ScrollTrigger);

/**
 * PLACEHOLDER FIGURES — replace with the firm's audited numbers before launch.
 * Publishing an invented success rate on a solicitor's site is an SRA
 * transparency issue, not just a copy issue. Remove the win-rate stat entirely
 * if it cannot be substantiated.
 */
const STATS = [
  { value: 12, suffix: "+", label: "Years in practice" },
  { value: 100, suffix: "+", label: "Matters resolved" },
  { value: 95, suffix: "%", label: "Resolved without trial" },
  { value: 2, suffix: "k+", label: "Clients advised" },
];

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const nodes = gsap.utils.toArray<HTMLElement>("[data-count]");

      mm.add("(prefers-reduced-motion: reduce)", () => {
        nodes.forEach((node) => {
          node.textContent = node.dataset.count ?? "";
        });
      });

      // 5.4 — count from 0 over 1.6s, once
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        nodes.forEach((node) => {
          const end = Number(node.dataset.count);
          const counter = { v: 0 };

          gsap.to(counter, {
            v: end,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              node.textContent = String(Math.round(counter.v));
            },
            scrollTrigger: {
              trigger: root.current,
              start: "top 82%",
              once: true,
            },
          });
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative">
      <div className="notch bg-surface pt-16 pb-24 md:pt-20 md:pb-28">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-12 px-4 md:grid-cols-4 md:px-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="md:px-4">
              <div className="font-display text-[2.75rem] leading-none font-medium tracking-tighter md:text-[3.5rem]">
                <span data-count={stat.value}>0</span>
                <span className="text-accent">{stat.suffix}</span>
              </div>
              <div className="mt-3 text-[0.9rem] text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Medallion sits in the notch */}
      <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center">
        <Medallion />
      </div>
    </section>
  );
}
