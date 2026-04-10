"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NavbarUser = {
  id: string;
  email: string | null;
} | null;

function navItemClass(active: boolean) {
  return active
    ? "inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
    : "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100";
}

export default function Navbar({
  initialUser,
}: {
  initialUser: NavbarUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<NavbarUser>(initialUser);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/try-on", label: "Try-On" },
    { href: "/wardrobe", label: "Wardrobe" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/outfits", label: "My Outfits" },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    setMobileOpen(false);
    router.replace("/auth");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-semibold">
            F
          </div>
          <span className="text-xl font-semibold text-zinc-900">FitMe AI</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClass(pathname === item.href)}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
              >
                Profile
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
                  <div className="text-xs text-zinc-500">Signed in as</div>
                  <div className="mt-1 break-all text-sm font-medium text-zinc-900">
                    {user.email}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="ml-2 inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
            >
              Login / Register
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 md:hidden"
        >
          Menu
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={navItemClass(pathname === item.href)}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="mt-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs text-zinc-500">Signed in as</div>
                <div className="mt-1 break-all text-sm font-medium text-zinc-900">
                  {user.email}
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
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