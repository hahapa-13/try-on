"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    value: 35,
    suffix: "%+",
    label: "Sales Lift",
    sub: "Increase conversions with more confident shoppers.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    value: 40,
    suffix: "%+",
    label: "Returns Reduction",
    sub: "Reduce return rates by helping customers choose right.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
      </svg>
    ),
  },
  {
    value: 98,
    suffix: "%+",
    label: "User Satisfaction",
    sub: "Deliver a better shopping experience every time.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    value: 95,
    suffix: "%+",
    label: "Enhanced Fit Realism",
    sub: "Advanced AI provides highly accurate size predictions.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
] as const;

/* ─── Count-up hook ─── */
function useCountUp(target: number, duration = 1700, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    const t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return count;
}

/* ─── Individual stat card ─── */
function StatCard({
  value,
  suffix,
  label,
  sub,
  icon,
  index,
}: (typeof STATS)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, 1600, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setActive(true); obs.disconnect(); }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="reveal glass-card rounded-2xl p-6 sm:p-8"
      style={{ transitionDelay: `${index * 80}ms`, borderColor: "var(--black-border-bright)" }}
    >
      {/* Icon */}
      <div
        className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: "rgba(201,151,74,0.10)",
          border:     "1px solid rgba(201,151,74,0.18)",
        }}
      >
        {icon}
      </div>

      {/* Number */}
      <div className="stat-number" style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
        {count}{suffix}
      </div>

      {/* Label */}
      <div className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {label}
      </div>

      {/* Sub */}
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {sub}
      </p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section
      className="relative py-16 sm:py-24"
      style={{
        background:  "linear-gradient(to bottom, var(--black) 0%, #0d0d0d 100%)",
        borderTop:   "1px solid var(--black-border)",
      }}
    >
      {/* Gold rule at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,151,74,0.28), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
