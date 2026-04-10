import { type PropsWithChildren } from "react";

export function Container({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={["mx-auto w-full max-w-6xl px-4", className].join(" ")}>
      {children}
    </div>
  );
}

