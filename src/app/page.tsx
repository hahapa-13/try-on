"use client";

import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/ui/Button";
import { useUser } from "@/hooks/useUser";

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-black text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
          {step}
        </div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Container className="py-8 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-10">
          <section className="space-y-6 text-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              AI virtual try-on, simplified
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                Try clothes on yourself before buying
              </h1>

              <p className="mx-auto max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
                Upload your photo, choose clothing from your wardrobe or wishlist,
                and save complete looks in one clean flow.
              </p>
            </div>

            <div className="grid gap-3 sm:flex sm:flex-row sm:items-center sm:justify-center">
              <ButtonLink href="/try-on" className="w-full sm:w-auto">
                {user ? "Go to Try-On" : "Start Try-On"}
              </ButtonLink>

              {!user && (
                <ButtonLink
                  href="/auth"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Login / Register
                </ButtonLink>
              )}

              {user && (
                <ButtonLink
                  href="/outfits"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  My Outfits
                </ButtonLink>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Upload photo
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Use your own image or reuse an existing avatar.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Pick clothing
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Choose items from wardrobe or wishlist.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Save outfits
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Keep the looks you like and reuse them later.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                How it works
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                A simple flow built for fast testing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StepCard
                step="1"
                title="Choose avatar"
                description="Upload your photo or reuse an outfit."
              />
              <StepCard
                step="2"
                title="Select clothing"
                description="Pick from wardrobe or wishlist."
              />
              <StepCard
                step="3"
                title="Generate & save"
                description="Preview and save your outfits."
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FeatureCard
              title="Wardrobe"
              description="Save and reuse your items."
            />
            <FeatureCard
              title="Wishlist"
              description="Keep items to try later."
            />
            <FeatureCard
              title="Outfits"
              description="Store complete looks."
            />
          </section>
        </div>
      </Container>
    </div>
  );
}