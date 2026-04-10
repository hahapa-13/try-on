import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { signOut } from "@/app/auth/actions";

export default function DashboardPage() {
  return (
    <div className="bg-zinc-50 dark:bg-black">
      <PageHeader
        title="Dashboard"
        subtitle="Your saved looks, activity, and quick actions."
      />
      <Container className="py-8">
        <div className="flex items-center justify-end">
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Quick start
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Jump back into a new try-on or manage your wardrobe.
                </div>
              </div>
              <ButtonLink href="/try-on">Start Try-On</ButtonLink>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Account
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Manage your login and security settings.
            </div>
            <div className="mt-4">
              <ButtonLink href="/auth" variant="secondary">
                Auth page
              </ButtonLink>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Wardrobe
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Save items you own to reuse across try-ons.
            </p>
            <div className="mt-4">
              <ButtonLink href="/wardrobe" variant="secondary">
                Open wardrobe
              </ButtonLink>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Wishlist
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Collect items you’re considering before you buy.
            </p>
            <div className="mt-4">
              <ButtonLink href="/wishlist" variant="secondary">
                View wishlist
              </ButtonLink>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

