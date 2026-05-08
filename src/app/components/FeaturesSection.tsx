"use client";

const FEATURES = [
  {
    title: "Your Wardrobe",
    description:
      "Save and organize every item you own. Add from your camera roll, paste a URL, or capture directly from a try-on session. Always ready for the next look.",
    bullets: [
      "Add items by file or URL",
      "Organize by type & title",
      "One-click send to Try-On",
    ],
    href:     "/wardrobe",
    cta:      "Open Wardrobe",
    gradient: "rgba(201,151,74,0.07)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M8 3v18M12 7h4M12 11h4M12 15h4" />
      </svg>
    ),
  },
  {
    title: "Your Wishlist",
    description:
      "Found something you love but not ready to commit? Save it, try it on virtually, decide with confidence — no more buyer's remorse or costly returns.",
    bullets: [
      "Save from any store",
      "Try before you buy",
      "Move to wardrobe when purchased",
    ],
    href:     "/wishlist",
    cta:      "Open Wishlist",
    gradient: "rgba(139,92,246,0.07)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: "Your Outfits",
    description:
      "Every AI try-on you generate and save lives here as your permanent lookbook. Revisit, reshare, or use as an avatar — your fashion history, curated.",
    bullets: [
      "AI-generated results saved",
      "Reuse any look as avatar",
      "Build your lookbook over time",
    ],
    href:     "/outfits",
    cta:      "View Outfits",
    gradient: "rgba(6,182,212,0.07)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <rect x="3"  y="3"  width="7" height="7" rx="1" />
        <rect x="14" y="3"  width="7" height="7" rx="1" />
        <rect x="3"  y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
] as const;

const BRANDS = [
  "ZARA", "H&M", "MANGO", "ASOS", "NIKE", "Bershka", "Massimo Dutti", "STRADIVARIUS",
  // duplicate for seamless infinite loop
  "ZARA", "H&M", "MANGO", "ASOS", "NIKE", "Bershka", "Massimo Dutti", "STRADIVARIUS",
];

export function FeaturesSection() {
  return (
    <section
      className="relative py-24 sm:py-36"
      style={{
        background: "linear-gradient(to bottom, var(--black-soft) 0%, var(--black) 100%)",
        borderTop:  "1px solid var(--black-border)",
      }}
    >
      {/* Ambient orb */}
      <div
        className="orb orb-cyan pointer-events-none absolute"
        style={{ width: 500, height: 500, bottom: "15%", right: "-100px", opacity: 0.65 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Section label */}
        <p
          className="mb-4 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          Everything You Need
        </p>

        {/* Headline */}
        <h2
          className="font-display reveal mb-5 text-center leading-tight"
          style={{
            fontSize:      "clamp(30px, 4.5vw, 58px)",
            fontWeight:    700,
            letterSpacing: "-0.02em",
            color:         "var(--text-primary)",
          }}
        >
          Built around how
          <br />
          <span className="text-gold-shimmer">you actually shop</span>
        </h2>

        <p
          className="reveal mx-auto mb-20 max-w-xl text-center text-base leading-relaxed"
          style={{ color: "var(--text-secondary)", transitionDelay: "80ms" }}
        >
          Every feature is designed for the real decisions you make before clicking &ldquo;Add to cart.&rdquo;
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        {/* Brand ticker */}
        <div className="reveal mt-20" style={{ transitionDelay: "200ms" }}>
          <p
            className="mb-6 text-center text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-dim)" }}
          >
            Trusted by leading fashion &amp; e-commerce brands
          </p>

          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
              style={{ background: "linear-gradient(to right, var(--black), transparent)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
              style={{ background: "linear-gradient(to left, var(--black), transparent)" }}
              aria-hidden="true"
            />

            <div className="ticker-track" aria-hidden="true">
              {BRANDS.map((brand, i) => (
                <div
                  key={`${brand}-${i}`}
                  className="font-display mx-10 flex shrink-0 items-center whitespace-nowrap text-xl font-semibold"
                  style={{ color: "var(--text-dim)", letterSpacing: "0.05em" }}
                >
                  {brand}
                  <span
                    className="ml-10 inline-block h-1 w-1 rounded-full"
                    style={{ background: "var(--gold-dim)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Extracted to keep mouse handlers co-located with "use client" ── */
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  return (
    <div
      className="reveal glass-card tilt-card relative flex flex-col overflow-hidden rounded-2xl p-7"
      style={{
        transitionDelay: `${index * 100}ms`,
        borderColor:     "var(--black-border-bright)",
      }}
      onMouseMove={(e) => {
        const el   = e.currentTarget as HTMLDivElement;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        el.style.transform =
          `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
    >
      {/* Corner gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at top left, ${feature.gradient} 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="relative mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: "rgba(201,151,74,0.10)",
          border:     "1px solid rgba(201,151,74,0.18)",
          color:      "var(--gold)",
        }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3
        className="relative mb-2 text-lg font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="relative mb-5 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {feature.description}
      </p>

      {/* Bullets */}
      <ul className="relative flex-1 space-y-2.5">
        {feature.bullets.map((b) => (
          <li
            key={b}
            className="flex items-center gap-2.5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(201,151,74,0.14)" }}
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="var(--gold)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA link */}
      <a
        href={feature.href}
        className="relative mt-7 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: "var(--gold)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-light)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)")
        }
      >
        {feature.cta}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,151,74,0.18), transparent)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}