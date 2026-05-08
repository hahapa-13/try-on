"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HomeNavbarProps {
  user: { id: string; email: string | null } | null;
}

const navLinks = [
  { label: "Try On",     href: "/try-on" },
  { label: "Wardrobe",   href: "/wardrobe" },
  { label: "Wishlist",   href: "/wishlist" },
  { label: "My Outfits", href: "/outfits" },
];

export function HomeNavbar({ user }: HomeNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(8,8,8,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="FitMe AI home"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
              color: "#080808",
              boxShadow: "0 2px 12px var(--gold-glow)",
            }}
          >
            F
          </div>
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            FitMe AI
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color      = "var(--text-primary)";
                  el.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color      = "var(--text-secondary)";
                  el.style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Desktop right side ── */}
        <div className="hidden items-center gap-3 md:flex">
          {mounted && user ? (
            <>
              <Link
                href="/try-on"
                className="btn-gold rounded-lg px-5 py-2.5 text-sm font-bold"
                style={{ color: "#080808" }}
              >
                Open App
              </Link>
              {/* Avatar initial circle */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: "var(--gold-glow)",
                  border: "1px solid var(--gold-dim)",
                  color: "var(--gold)",
                }}
                title={user.email ?? ""}
                aria-label={`Signed in as ${user.email}`}
              >
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                href="/try-on"
                className="btn-gold rounded-lg px-5 py-2.5 text-sm font-bold"
                style={{ color: "#080808" }}
              >
                Get started →
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className="block h-px w-5 rounded-full transition-all duration-300"
            style={{
              background: "var(--text-secondary)",
              transform: menuOpen
                ? "rotate(45deg) translate(3.5px, 3.5px)"
                : "",
            }}
          />
          <span
            className="block h-px rounded-full transition-all duration-300"
            style={{
              background: "var(--text-secondary)",
              width: menuOpen ? "0" : "20px",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block h-px w-5 rounded-full transition-all duration-300"
            style={{
              background: "var(--text-secondary)",
              transform: menuOpen
                ? "rotate(-45deg) translate(3.5px, -3.5px)"
                : "",
            }}
          />
        </button>
      </nav>

      {/* ── Mobile dropdown menu ── */}
      <div
        className="overflow-hidden transition-all duration-400 ease-in-out md:hidden"
        style={{
          maxHeight: menuOpen ? "420px" : "0",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          background: "rgba(8,8,8,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col gap-1 p-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div
            className="mt-4 flex flex-col gap-2 border-t pt-4"
            style={{ borderColor: "var(--black-border)" }}
          >
            {mounted && user ? (
              <>
                <div
                  className="rounded-lg px-4 py-2 text-xs"
                  style={{ color: "var(--text-dim)" }}
                >
                  Signed in as {user.email}
                </div>
                <Link
                  href="/try-on"
                  className="btn-gold rounded-lg px-4 py-3 text-center text-sm font-bold"
                  style={{ color: "#080808" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Open App
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="btn-ghost rounded-lg px-4 py-3 text-center text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/try-on"
                  className="btn-gold rounded-lg px-4 py-3 text-center text-sm font-bold"
                  style={{ color: "#080808" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Get started →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
