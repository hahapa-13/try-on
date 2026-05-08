"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Proprietary Image Input",
    description:
      "Upload a full-body photo or reuse an existing avatar from your outfits library. Our AI reads your body shape, proportions, and lighting in milliseconds.",
    detail: "Supports JPG · PNG · WEBP up to 10MB",
    accentBg:     "rgba(201,151,74,0.12)",
    accentBorder: "rgba(201,151,74,0.24)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Hyper-Personalized AI Curation",
    description:
      "Our AI analyzes your body shape, preferences, and context to place the garment precisely — realistic draping, lighting match, no clipping, ever.",
    detail: "Works with any item from any store",
    accentBg:     "rgba(139,92,246,0.10)",
    accentBorder: "rgba(139,92,246,0.22)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2L2 7l4 2v11a1 1 0 001 1h10a1 1 0 001-1V9l4-2-4-5"/>
        <path d="M9 2s.5 3 3 3 3-3 3-3"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Unified Real-Time Output & Share",
    description:
      "See the photorealistic try-on result in under 30 seconds. Save it to your outfits, use it as your avatar, or share it — your look, confirmed.",
    detail: "Results ready in under 30 seconds",
    accentBg:     "rgba(6,182,212,0.10)",
    accentBorder: "rgba(6,182,212,0.22)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
] as const;

export function HowItWorks() {
  const svgPathRef = useRef<SVGPathElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* Trigger the SVG line draw animation on scroll */
  useEffect(() => {
    const section = sectionRef.current;
    const path    = svgPathRef.current;
    if (!section || !path) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          path.classList.add("animate-draw-line");
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-36"
      style={{
        background: "linear-gradient(to bottom, #0d0d0d 0%, var(--black-soft) 100%)",
        borderTop:  "1px solid var(--black-border)",
      }}
    >
      {/* Ambient orb */}
      <div
        className="orb orb-purple pointer-events-none absolute"
        style={{ width: 600, height: 600, top: "10%", left: "50%", transform: "translateX(-50%)", opacity: 0.55 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Section label */}
        <p
          className="mb-4 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          How It Works
        </p>

        {/* Headline */}
        <h2
          className="font-display reveal mb-5 text-center leading-tight"
          style={{
            fontSize:      "clamp(32px, 5vw, 64px)",
            fontWeight:    700,
            letterSpacing: "-0.02em",
            color:         "var(--text-primary)",
          }}
        >
          The Proprietary 3-Step Engine
          <br />
          to{" "}
          <span className="text-gold-shimmer">Zero Friction</span>
        </h2>

        <p
          className="reveal mx-auto mb-20 max-w-xl text-center text-base leading-relaxed"
          style={{ color: "var(--text-secondary)", transitionDelay: "80ms" }}
        >
          Three intelligent steps that turn uncertainty into confidence — and browsers into buyers.
        </p>

        {/* Animated SVG connector (desktop only) */}
        <div
          className="pointer-events-none absolute left-0 right-0 hidden lg:block"
          style={{ top: "490px", zIndex: 0 }}
          aria-hidden="true"
        >
          <svg
            width="100%"
            height="120"
            viewBox="0 0 1200 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              ref={svgPathRef}
              d="M100 60 C 250 60 250 100 400 100 C 550 100 550 20 700 20 C 850 20 850 100 1000 100 C 1150 100 1150 60 1300 60"
              stroke="rgba(201,151,74,0.18)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 14"
              fill="none"
            />
            {/* Animated dots on path waypoints */}
            {([
              [100, 60], [400, 100], [700, 20], [1000, 100],
            ] as [number, number][]).map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="5"
                fill="var(--gold)"
                opacity="0.65"
                className="animate-glow-pulse"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </svg>
        </div>

        {/* Step cards */}
        <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="reveal mt-16 text-center" style={{ transitionDelay: "360ms" }}>
          <Link
            href="/try-on"
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold"
            style={{ color: "#080808" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Try it now — it&apos;s free
          </Link>
          <p className="mt-3 text-xs" style={{ color: "var(--text-dim)" }}>
            No account required to start
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Step card with 3D tilt ─── */
function StepCard({
  step,
  index,
}: {
  step: (typeof STEPS)[0];
  index: number;
}) {
  return (
    <div
      className="reveal glass-card tilt-card relative overflow-hidden rounded-2xl p-7"
      style={{
        transitionDelay:  `${index * 110}ms`,
        borderColor:      "var(--black-border-bright)",
      }}
      onMouseMove={(e) => {
        const el   = e.currentTarget as HTMLDivElement;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        el.style.transform =
          `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.01)`;
        el.style.boxShadow =
          `${-x * 14}px ${-y * 14}px 40px rgba(201,151,74,0.07)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform  = "";
        el.style.boxShadow  = "";
      }}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
        style={{ background: step.accentBg, filter: "blur(24px)" }}
        aria-hidden="true"
      />

      {/* Large background number */}
      <div
        className="font-display pointer-events-none absolute -top-1 right-2 select-none text-8xl font-bold leading-none opacity-[0.07]"
        style={{ color: "var(--gold)" }}
        aria-hidden="true"
      >
        {step.number}
      </div>

      {/* Icon + numbered pill */}
      <div className="relative mb-6 flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: step.accentBg,
            border:     `1px solid ${step.accentBorder}`,
            color:      "var(--gold)",
          }}
        >
          {step.icon}
        </div>
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: "var(--gold)", color: "#080808" }}
        >
          {index + 1}
        </div>
      </div>

      {/* Title */}
      <h3
        className="relative mb-3 text-lg font-bold leading-snug"
        style={{ color: "var(--text-primary)" }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        className="relative mb-5 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {step.description}
      </p>

      {/* Detail chip */}
      <div
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
        style={{
          background: "rgba(255,255,255,0.03)",
          border:     "1px solid var(--black-border-bright)",
          color:      "var(--text-dim)",
        }}
      >
        <span
          className="inline-block h-1 w-1 rounded-full"
          style={{ background: "var(--gold)" }}
        />
        {step.detail}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.accentBorder}, transparent)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
