"use client";

import Link from "next/link";

interface CTAButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
}

export function CTAButton({
  href,
  variant = "primary",
  children,
  className = "",
}: CTAButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold " +
    "transition-all duration-200 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const styles: Record<string, string> = {
    primary:   "btn-gold px-6 py-3",
    secondary: "btn-ghost px-6 py-3",
    ghost:     "btn-ghost px-6 py-3",
  };

  return (
    <Link
      href={href}
      className={`${base} ${styles[variant]} ${className}`}
      style={variant === "primary" ? { color: "#080808" } : undefined}
    >
      {children}
    </Link>
  );
}
