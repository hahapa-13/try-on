"use client";

import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that adds the "visible" class
 * to every element carrying a "reveal" or "reveal-scale" class.
 * Place this once at the end of the page — it covers the whole document.
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-scale"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
