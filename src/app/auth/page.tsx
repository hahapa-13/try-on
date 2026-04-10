import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signIn, signUp } from "./actions";

export default async function AuthPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  const { error } = (await searchParams) ?? {};

  return (
    <div className="bg-zinc-50 dark:bg-black">
      <Container className="py-10">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome to FitMe AI
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Login or create an account to save looks to your wardrobe and
            wishlist.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <form action={signIn} className="grid gap-3">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Login
              </div>
              <label className="grid gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:ring-zinc-50/10"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:ring-zinc-50/10"
                />
              </label>
              <Button type="submit">Login</Button>
            </form>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

            <form action={signUp} className="grid gap-3">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Register
              </div>
              <label className="grid gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:ring-zinc-50/10"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:ring-zinc-50/10"
                />
              </label>
              <Button type="submit" variant="secondary">
                Create account
              </Button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <ButtonLink
              href="/try-on"
              variant="secondary"
              className="px-3 py-2"
            >
              Continue to Try-On
            </ButtonLink>
            <ButtonLink
              href="/dashboard"
              variant="secondary"
              className="px-3 py-2"
            >
              Go to Dashboard
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  );
}

