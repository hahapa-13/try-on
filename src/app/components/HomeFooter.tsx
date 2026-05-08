"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Try On",     href: "/try-on" },
    { label: "Wardrobe",   href: "/wardrobe" },
    { label: "Wishlist",   href: "/wishlist" },
    { label: "My Outfits", href: "/outfits" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog",     href: "/blog" },
    { label: "Careers",  href: "/careers" },
    { label: "Contact",  href: "/contact" },
  ],
  Resources: [
    { label: "Help Center",       href: "/help" },
    { label: "Privacy Policy",    href: "/privacy" },
    { label: "Terms of Service",  href: "/terms" },
    { label: "Docs",              href: "/docs" },
  ],
} as const;

const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 00-1.95 1.95C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95C23 15.88 23 12 23 12s0-3.88-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" stroke="none" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
] as const;

export function HomeFooter() {
  return (
    <footer
      style={{
        background: "var(--black)",
        borderTop:  "1px solid var(--black-border)",
      }}
    >
      {/* ── Main grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
                  color:      "#080808",
                }}
              >
                F
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                FitMe AI
              </span>
            </Link>

            <p
              className="mt-4 max-w-xs text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              AI virtual try-on technology for fashion e-commerce that drives results.
            </p>

            {/* Socials */}
            <div className="mt-6 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200"
                  style={{
                    color:       "var(--text-dim)",
                    border:      "1px solid var(--black-border-bright)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color       = "var(--gold)";
                    el.style.borderColor = "rgba(201,151,74,0.28)";
                    el.style.background  = "rgba(201,151,74,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color       = "var(--text-dim)";
                    el.style.borderColor = "var(--black-border-bright)";
                    el.style.background  = "transparent";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <p
                className="mb-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-dim)" }}
              >
                Stay in the loop
              </p>
              <p className="mb-4 text-xs" style={{ color: "var(--text-dim)" }}>
                Get the latest updates and AI fashion insights.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border:     "1px solid var(--black-border-bright)",
                    color:      "var(--text-primary)",
                  }}
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="btn-gold flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ color: "#080808" }}
                  aria-label="Subscribe"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {(
            Object.entries(FOOTER_LINKS) as [
              string,
              readonly { label: string; href: string }[]
            ][]
          ).map(([heading, links]) => (
            <div key={heading}>
              <h4
                className="mb-5 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-primary)" }}
              >
                {heading}
              </h4>
              <ul className="space-y-3.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color =
                          "var(--gold)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color =
                          "var(--text-secondary)")
                      }
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: "1px solid var(--black-border)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            © 2025 FitMe AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-dim)" }}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-glow-pulse"
              style={{ background: "#10b981" }}
            />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}