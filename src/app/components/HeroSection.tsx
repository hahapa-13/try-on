"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Particle data ─── */
const PARTICLES = [
  { w: 3, h: 3, top: "18%", left: "12%",  bg: "rgba(201,151,74,0.7)",  dur: "9s",  del: "0s"  },
  { w: 2, h: 2, top: "35%", left: "8%",   bg: "rgba(201,151,74,0.4)",  dur: "12s", del: "2s"  },
  { w: 4, h: 4, top: "55%", left: "18%",  bg: "rgba(139,92,246,0.5)",  dur: "15s", del: "4s"  },
  { w: 2, h: 2, top: "72%", left: "5%",   bg: "rgba(6,182,212,0.4)",   dur: "11s", del: "1s"  },
  { w: 3, h: 3, top: "20%", right: "10%", bg: "rgba(201,151,74,0.5)",  dur: "13s", del: "3s"  },
  { w: 2, h: 2, top: "45%", right: "7%",  bg: "rgba(201,151,74,0.3)",  dur: "10s", del: "5s"  },
  { w: 4, h: 4, top: "65%", right: "15%", bg: "rgba(139,92,246,0.4)",  dur: "14s", del: "2s"  },
  { w: 2, h: 2, top: "82%", right: "22%", bg: "rgba(6,182,212,0.35)",  dur: "16s", del: "6s"  },
  { w: 3, h: 3, top: "30%", left: "45%",  bg: "rgba(201,151,74,0.2)",  dur: "18s", del: "7s"  },
] as const;

export function HeroSection() {
  const showcaseRef = useRef<HTMLDivElement>(null);

  /* Subtle mouse-parallax on the product showcase */
  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      el.style.transform =
        `perspective(1200px) rotateY(${x}deg) rotateX(${-y}deg)`;
    };
    const onLeave = () => {
      el.style.transform =
        "perspective(1200px) rotateY(0deg) rotateX(0deg)";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-16"
      style={{ background: "var(--black)" }}
    >
      {/* ── Ambient background orbs ── */}
      <div
        className="orb orb-gold animate-glow-pulse"
        style={{ width: 700, height: 700, top: "-200px", left: "50%", transform: "translateX(-50%)" }}
        aria-hidden="true"
      />
      <div
        className="orb orb-purple"
        style={{ width: 500, height: 500, bottom: "10%", left: "-100px" }}
        aria-hidden="true"
      />
      <div
        className="orb orb-cyan"
        style={{ width: 400, height: 400, bottom: "5%", right: "-80px" }}
        aria-hidden="true"
      />

      {/* Top gradient veil */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(201,151,74,0.06) 0%, transparent 60%)",
        }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width:  p.w,
            height: p.h,
            top:    p.top,
            left:   ("left"  in p ? p.left  : undefined) as string | undefined,
            right:  ("right" in p ? p.right : undefined) as string | undefined,
            background:        p.bg,
            animationDuration: p.dur,
            animationDelay:    p.del,
          }}
          aria-hidden="true"
        />
      ))}

      {/* ── Main content ── */}
      <div className="relative mx-auto max-w-7xl px-6">

        {/* ── Hero text ── */}
        <div className="pt-24 pb-16 text-center">

          {/* Badge */}
          <div className="animate-badge-pop mb-8 inline-flex">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(201,151,74,0.08)",
                border: "1px solid rgba(201,151,74,0.22)",
                color: "var(--gold)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full animate-glow-pulse"
                style={{ background: "var(--gold)" }}
              />
              AI-Powered Try-On
            </span>
          </div>

          {/* Headline — Cormorant Garamond serif */}
          <h1
            className="font-display animate-fade-in-up delay-150 mx-auto max-w-4xl leading-none"
            style={{
              fontSize: "clamp(54px, 9vw, 112px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--text-primary)" }}>Try On.</span>
            <br />
            <span className="text-gold-shimmer">Instantly.</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="animate-fade-in-up delay-300 mx-auto mt-7 max-w-2xl leading-relaxed"
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-secondary)",
            }}
          >
            See it on{" "}
            <em
              className="not-italic font-semibold"
              style={{ color: "var(--gold-light)" }}
            >
              you
            </em>
            . Love it.{" "}
            Upload your photo, pick any item — and watch AI dress you in
            seconds. Eliminate fashion uncertainty forever.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-500 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/try-on"
              className="btn-gold rounded-xl px-8 py-3.5 text-sm font-bold tracking-wide"
              style={{ color: "#080808" }}
            >
              Launch Your Fitting Room →
            </Link>
            <Link
              href="/outfits"
              className="btn-ghost rounded-xl px-6 py-3.5 text-sm font-medium"
            >
              View My Outfits
            </Link>
          </div>

          {/* Trust micro-line */}
          <div
            className="animate-fade-in delay-700 mt-5 flex flex-wrap items-center justify-center gap-6 text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            {["No credit card required", "14-day free trial", "Cancel anytime"].map(
              (t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="5" cy="5" r="4.5" stroke="rgba(201,151,74,0.4)" />
                    <path
                      d="M3 5l1.5 1.5L7 3.5"
                      stroke="var(--gold)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t}
                </span>
              )
            )}
          </div>
        </div>

        {/* ── Product showcase ── */}
        <div
          ref={showcaseRef}
          className="animate-scale-in delay-400 mx-auto max-w-5xl"
          style={{ transition: "transform 0.14s ease-out", transformStyle: "preserve-3d" }}
        >
          {/* Gold border gradient wrapper */}
          <div
            className="relative rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,151,74,0.18) 0%, rgba(139,92,246,0.07) 50%, rgba(6,182,212,0.05) 100%)",
              padding: "1px",
            }}
          >
            {/* Inner card */}
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: "var(--black-card)",
                border: "1px solid var(--black-border-bright)",
              }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2 px-5 py-3.5"
                style={{
                  borderBottom: "1px solid var(--black-border)",
                  background:   "rgba(255,255,255,0.02)",
                }}
              >
                {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c, i) => (
                  <div key={i} className="h-3 w-3 rounded-full" style={{ background: c }} />
                ))}
                <div
                  className="mx-auto flex max-w-[200px] flex-1 items-center justify-center rounded-md px-3 text-[11px]"
                  style={{
                    height:     "24px",
                    background: "rgba(255,255,255,0.04)",
                    color:      "var(--text-dim)",
                  }}
                >
                  fitme.ai/try-on
                </div>
              </div>

              {/* Three-panel layout */}
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">

                  {/* Panel — Avatar */}
                  <AppPanel label="Your Photo">
                    <AvatarIcon />
                  </AppPanel>

                  {/* Panel — Clothing */}
                  <AppPanel label="Selected Item">
                    <ClothingIcon />
                  </AppPanel>

                  {/* Panel — Result (highlighted with gold border) */}
                  <div
                    className="relative overflow-hidden rounded-xl"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, var(--gold) 0%, transparent 65%)",
                        padding: "1px",
                      }}
                    >
                      <div
                        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl"
                        style={{
                          background: "linear-gradient(160deg, #16120a 0%, #0c0c08 100%)",
                        }}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="rgba(201,151,74,0.65)"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span className="text-xs" style={{ color: "var(--gold-dim)" }}>
                          AI Result
                        </span>
                      </div>
                    </div>
                    {/* Badge */}
                    <div
                      className="absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "var(--gold)", color: "#080808" }}
                    >
                      AI Try-On Result
                    </div>
                  </div>
                </div>

                {/* Mock generate button */}
                <div className="mt-4 flex justify-center">
                  <div
                    className="btn-gold inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold"
                    style={{ color: "#080808", cursor: "default" }}
                    aria-hidden="true"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Generate with AI
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat widget — bottom-left */}
          <div
            className="animate-float glass-card absolute -left-4 bottom-14 hidden items-center gap-3 rounded-2xl p-3 sm:flex sm:-left-8"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.45)", minWidth: 176 }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(201,151,74,0.12)",
                border:     "1px solid rgba(201,151,74,0.2)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                Sales Lift
              </div>
              <div className="stat-number text-xl">+35%</div>
            </div>
          </div>

          {/* Floating stat widget — top-right */}
          <div
            className="animate-float-delay glass-card absolute -right-4 top-10 hidden items-center gap-3 rounded-2xl p-3 sm:flex sm:-right-8"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.45)", minWidth: 192 }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(201,151,74,0.12)",
                border:     "1px solid rgba(201,151,74,0.2)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                Return Reduction
              </div>
              <div className="stat-number text-xl">–40%</div>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, var(--black), transparent)" }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

/* ─── Small sub-components ─── */

function AppPanel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl"
      style={{
        aspectRatio: "3/4",
        border:      "1px solid var(--black-border-bright)",
      }}
    >
      <div
        className="flex flex-1 flex-col items-center justify-center gap-2"
        style={{ background: "linear-gradient(160deg, #141414 0%, #0f0f0f 100%)" }}
      >
        {children}
      </div>
      <div
        className="px-3 py-2 text-[11px] font-medium"
        style={{
          background:  "rgba(255,255,255,0.025)",
          borderTop:   "1px solid var(--black-border)",
          color:       "var(--text-dim)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function AvatarIcon() {
  return (
    <>
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(201,151,74,0.45)"
        strokeWidth="1.3"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
      <span className="text-xs" style={{ color: "var(--text-dim)" }}>
        Avatar
      </span>
    </>
  );
}

function ClothingIcon() {
  return (
    <>
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(201,151,74,0.45)"
        strokeWidth="1.3"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 2L2 7l4 2v11a1 1 0 001 1h10a1 1 0 001-1V9l4-2-4-5" />
        <path d="M9 2s.5 3 3 3 3-3 3-3" />
      </svg>
      <span className="text-xs" style={{ color: "var(--text-dim)" }}>
        Clothing
      </span>
    </>
  );
}
