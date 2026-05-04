"use client";

import { CTAButton } from "./CTAButton";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-0">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI-Powered Try-On
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl">
          Try clothes on yourself{" "}
          <span className="relative whitespace-nowrap">
            before buying
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 6C50 2 100 1 150 3C200 5 250 5 298 2"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-zinc-500">
          Upload your photo, pick any item from your wardrobe or wishlist, and
          see exactly how it looks on you — instantly.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CTAButton
            href="/try-on"
            variant="primary"
            className="px-7 py-3 text-sm"
          >
            Start Try-On
          </CTAButton>

          <CTAButton
            href="/outfits"
            variant="secondary"
            className="px-7 py-3 text-sm"
          >
            See My Outfits
          </CTAButton>
        </div>

        {/* Micro trust */}
        <p className="mt-4 text-xs text-zinc-400">
          Free to use &middot; No credit card &middot; Results in seconds
        </p>

        {/* HERO IMAGE (REAL, PREMIUM) */}
        <div className="relative mt-14 mx-auto max-w-5xl">
          {/* subtle glow */}
          <div
            className="pointer-events-none absolute -inset-x-8 top-0 h-40 rounded-[40px]"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,0,0,0.04) 0%, transparent 80%)",
            }}
          />

          {/* image container */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01]">
            <img
              src="/images/hero.jpg"
              alt="AI try-on preview"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}