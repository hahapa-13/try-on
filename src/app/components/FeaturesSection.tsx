import { CTAButton } from "./CTAButton";

const features = [
  {
    title: "Your Wardrobe",
    description: "All your items, ready to try on anytime.",
    bullets: [
      "Add items by file or URL",
      "Organize easily",
      "One-click try-on",
    ],
    href: "/wardrobe",
    cta: "Open Wardrobe",
  },
  {
    title: "Your Wishlist",
    description: "Save anything you like before buying.",
    bullets: [
      "Save from any store",
      "Try before purchase",
      "Move to wardrobe later",
    ],
    href: "/wishlist",
    cta: "Open Wishlist",
  },
  {
    title: "Your Outfits",
    description: "All your AI-generated looks in one place.",
    bullets: [
      "Saved try-on results",
      "Reuse as avatar",
      "Build your lookbook",
    ],
    href: "/outfits",
    cta: "View Outfits",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-zinc-100 bg-zinc-50 py-32">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Built around how you actually shop.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <h3 className="mb-2 text-lg font-semibold text-black">
                {feature.title}
              </h3>

              <p className="text-sm text-zinc-500">
                {feature.description}
              </p>

              <ul className="mt-5 flex-1 space-y-2">
                {feature.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2 text-sm text-zinc-500"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <circle cx="7" cy="7" r="7" fill="#f4f4f5" />
                      <path
                        d="M4 7l2 2 4-4"
                        stroke="#18181b"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>

              <a
                href={feature.href}
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-black underline-offset-4 hover:underline"
              >
                {feature.cta}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2 7h10M7 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div className="mt-16 rounded-2xl border border-zinc-200 bg-black px-8 py-12 text-center">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to try it yourself?
          </h3>

          <p className="mt-3 text-zinc-400">
            Upload your first photo in seconds.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row justify-center">
            <CTAButton
              href="/try-on"
              variant="primary"
              className="border border-white bg-white px-7 py-3 text-black hover:bg-zinc-100"
            >
              Start Try-On — it&apos;s free
            </CTAButton>

            <span className="text-sm text-zinc-400">
              No credit card required
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}