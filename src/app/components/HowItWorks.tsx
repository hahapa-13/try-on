"use client";

const steps = [
  {
    number: "1",
    title: "Upload your photo",
    description: "Use your photo or reuse an existing avatar.",
  },
  {
    number: "2",
    title: "Pick clothing",
    description: "Choose from your wardrobe or wishlist.",
  },
  {
    number: "3",
    title: "Generate result",
    description: "See the AI try-on instantly.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Three simple steps to see your perfect look.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              {/* Number */}
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-black">
                {step.title}
              </h3>

              <p className="text-sm text-zinc-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <a
            href="/try-on"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-black transition hover:border-zinc-400 hover:bg-zinc-50"
          >
            Try it now — free
          </a>
        </div>
      </div>
    </section>
  );
}