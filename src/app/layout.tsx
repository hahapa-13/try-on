import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FitMe AI — Try clothes on yourself before buying",
  description:
    "AI-powered virtual try-on. Upload your photo, pick any clothing item, and see exactly how it looks on you — instantly.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  // Read the pathname injected by middleware.ts
  // On "/" we suppress the global white Navbar — homepage renders its own dark one
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";
  const isHomepage = pathname === "/";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {!isHomepage && (
          <Navbar
            initialUser={
              user
                ? { id: user.id, email: user.email ?? null }
                : null
            }
          />
        )}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}