"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Cases", href: "#cases" },
];

export default function Nav() {
  // The hero is dark footage, so the nav has to invert over it and return to
  // ink once the pin releases onto the light page.
  const [onDark, setOnDark] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;

    // The hero is pinned, so it sits at top:0 for its entire scroll range and
    // an intersection test never flips. Ask instead whether it still covers
    // the strip of viewport the nav occupies.
    let frame = 0;
    const check = () => {
      frame = 0;
      const r = hero.getBoundingClientRect();
      setOnDark(r.top <= 72 && r.bottom > 72);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      data-nav
      className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-8 md:pt-6"
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <a
          href="#home"
          className={`font-display text-[0.95rem] leading-tight font-medium tracking-tight transition-colors duration-500 md:text-[1.05rem] ${
            onDark ? "text-base" : "text-ink"
          }`}
        >
          Wildan
          <span
            className={`block text-[0.7rem] font-normal tracking-[0.14em] transition-colors duration-500 ${
              onDark ? "text-base/60" : "text-muted"
            }`}
          >
            Legal Solicitors
          </span>
        </a>

        <ul
          className={`hidden items-center gap-1 rounded-pill p-1 backdrop-blur-md transition-colors duration-500 md:flex ${
            onDark ? "bg-base/10" : "bg-surface/80"
          }`}
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`block rounded-pill px-4 py-2 text-[0.9rem] transition-colors duration-300 ${
                  onDark
                    ? "text-base/80 hover:bg-base/15 hover:text-base"
                    : "text-ink/70 hover:bg-base hover:text-ink"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className={`rounded-pill px-5 py-2.5 text-[0.9rem] transition-colors duration-500 ${
            onDark
              ? "bg-base text-ink hover:bg-surface"
              : "bg-ink text-base hover:bg-deep"
          }`}
        >
          Book a call
        </a>
      </nav>
    </header>
  );
}
