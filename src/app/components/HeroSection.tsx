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
            {/* Underline accent */}
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

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CTAButton href="/try-on" variant="primary" className="px-7 py-3 text-sm">
            Start Try-On
          </CTAButton>
          <CTAButton href="/outfits" variant="secondary" className="px-7 py-3 text-sm">
            See My Outfits
          </CTAButton>
        </div>

        {/* Micro trust line */}
        <p className="mt-4 text-xs text-zinc-400">
          Free to use &middot; No credit card &middot; Results in seconds
        </p>

        {/* Hero image */}
        <div className="relative mt-14 mx-auto max-w-4xl">
          {/* Glow */}
          <div
            className="pointer-events-none absolute -inset-x-8 top-0 h-40 rounded-[40px]"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,0,0,0.04) 0%, transparent 80%)",
            }}
            aria-hidden="true"
          />

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06)] transition-transform duration-500 hover:-translate-y-1">
            {/* Simulated browser chrome */}
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <div className="ml-4 h-5 flex-1 rounded-md bg-zinc-100 text-center text-[10px] leading-5 text-zinc-400 max-w-[240px] mx-auto">
                fitme.ai/try-on
              </div>
            </div>

            {/* Product screenshot placeholder — replace with actual screenshot */}
            <div className="relative bg-zinc-50 px-6 pt-6 pb-0">
              <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4 pb-0">
                {/* Avatar panel */}
                <div className="col-span-1 rounded-xl border border-zinc-200 bg-white overflow-hidden">
                  <div className="bg-zinc-100 aspect-[3/4] flex flex-col items-center justify-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <span className="text-xs text-zinc-400">Your photo</span>
                  </div>
                  <div className="p-3">
                    <div className="h-2 w-16 rounded-full bg-zinc-100" />
                    <div className="mt-1.5 h-2 w-10 rounded-full bg-zinc-100" />
                  </div>
                </div>

                {/* Clothing panel */}
                <div className="col-span-1 rounded-xl border border-zinc-200 bg-white overflow-hidden">
                  <div className="bg-zinc-50 aspect-[3/4] flex flex-col items-center justify-center gap-2 p-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 2L2 7l4 2v11a1 1 0 001 1h10a1 1 0 001-1V9l4-2-4-5" />
                      <path d="M9 2s.5 3 3 3 3-3 3-3" />
                    </svg>
                    <span className="text-xs text-zinc-400">Selected item</span>
                  </div>
                  <div className="p-3">
                    <div className="h-2 w-16 rounded-full bg-zinc-100" />
                    <div className="mt-1.5 h-2 w-10 rounded-full bg-zinc-100" />
                  </div>
                </div>

                {/* Result panel */}
                <div className="col-span-1 rounded-xl border-2 border-black bg-white overflow-hidden relative">
                  <div className="absolute top-2 right-2 z-10 rounded-full bg-black px-2 py-0.5 text-[10px] text-white font-medium">
                    Result
                  </div>
                  <div className="bg-zinc-900 aspect-[3/4] flex flex-col items-center justify-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                    <span className="text-xs text-zinc-500">AI result</span>
                  </div>
                  <div className="p-3">
                    <div className="h-2 w-16 rounded-full bg-zinc-100" />
                    <div className="mt-1.5 h-2 w-10 rounded-full bg-zinc-100" />
                  </div>
                </div>
              </div>

              {/* Generate button inside screenshot */}
              <div className="py-4 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm text-white font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Generate with AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
