import Link from "next/link";

interface CTAButtonProps {
  href: string;
  variant?: "primary" | "secondary";
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
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 px-5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-black text-white hover:bg-zinc-800 active:scale-[0.98]",
    secondary:
      "border border-zinc-300 bg-white text-black hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.98]",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
