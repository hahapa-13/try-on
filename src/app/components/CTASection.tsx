"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-36"
      style={{
        background: "var(--black-soft)",
        borderTop:  "1px solid var(--black-border)",
      }}
    >
      {/* Gold centre orb */}
      <div
        className="orb orb-gold animate-glow-pulse pointer-events-none absolute"
        style={{
          width:     800,
          height:    800,
          top:       "50%",
          left:      "50%",
          transform: "translate(-50%,-50%)",
          opacity:   0.45,
        }}
        aria-hidden="true"
      />

      {/* Rotating rings */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="animate-spin-slow h-[500px] w-[500px] rounded-full opacity-10"
          style={{ border: "1px solid var(--gold)" }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="h-[720px] w-[720px] rounded-full opacity-[0.05]"
          style={{
            border:             "1px dashed var(--gold)",
            animation:          "spinSlow 34s linear infinite reverse",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">

        {/* Label badge */}
        <div className="mb-7 inline-flex">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(201,151,74,0.08)",
              border:     "1px solid rgba(201,151,74,0.2)",
              color:      "var(--gold)",
            }}
          >
            Ready to Transform Your Store?
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-display reveal mb-6 leading-tight"
          style={{
            fontSize:      "clamp(32px, 6vw, 72px)",
            fontWeight:    700,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>
            AI try-on that drives
          </span>
          <br />
          <span className="text-gold-shimmer">sales, reduces returns</span>
          <br />
          <span style={{ color: "var(--text-primary)" }}>
            and delights customers.
          </span>
        </h2>

        {/* Sub */}
        <p
          className="reveal mx-auto mb-10 max-w-lg text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)", transitionDelay: "100ms" }}
        >
          Upload your first photo in seconds. No account required.
          Experience the future of fashion retail today.
        </p>

        {/* CTAs */}
        <div
          className="reveal flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ transitionDelay: "200ms" }}
        >
          <Link
            href="/try-on"
            className="btn-gold rounded-xl px-8 py-4 text-base font-bold"
            style={{ color: "#080808" }}
          >
            Launch Your Fitting Room →
          </Link>
          <Link
            href="/outfits"
            className="btn-ghost rounded-xl px-6 py-4 text-base font-medium"
          >
            Book a Demo
          </Link>
        </div>

        {/* Trust line */}
        <div
          className="reveal mt-7 flex flex-wrap items-center justify-center gap-6 text-xs"
          style={{ color: "var(--text-dim)", transitionDelay: "300ms" }}
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
                  <circle cx="5" cy="5" r="4.5" stroke="rgba(201,151,74,0.35)" />
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
    </section>
  );
}
