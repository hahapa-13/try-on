"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Navbar() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href;
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      setMenuOpen(false);
      setProfileOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-zinc-50 dark:text-zinc-900">
            F
          </div>
          <span>FitMe AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              isActive("/")
                ? "bg-black text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            Home
          </Link>

          {!loading && user && (
            <>
              <Link
                href="/try-on"
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive("/try-on")
                    ? "bg-black text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                Try-On
              </Link>

              <Link
                href="/wardrobe"
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive("/wardrobe")
                    ? "bg-black text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                Wardrobe
              </Link>

              <Link
                href="/wishlist"
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive("/wishlist")
                    ? "bg-black text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                Wishlist
              </Link>

              <Link
                href="/outfits"
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive("/outfits")
                    ? "bg-black text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                My Outfits
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  Profile
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="px-3 py-2">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Signed in as
                    </div>
                    <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {user.email}
                    </div>
                  </div>

                    <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !user && (
            <Link
              href="/auth"
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Login / Register
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setMenuOpen((v) => !v);
            setProfileOpen(false);
          }}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 md:hidden dark:border-zinc-700 dark:text-zinc-50"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-black">
          <div className="grid gap-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Home
            </Link>

            {!loading && user && (
              <>
                <Link
                  href="/try-on"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  Try-On
                </Link>

                <Link
                  href="/wardrobe"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  Wardrobe
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  Wishlist
                </Link>

                <Link
                  href="/outfits"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  My Outfits
                </Link>

                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-left text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
                >
                  Profile
                </button>

                {profileOpen && (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Signed in as
                    </div>
                    <div className="mt-1 break-all text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {user.email}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="mt-3 w-full rounded-xl bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </>
            )}

            {!loading && !user && (
              <Link
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}