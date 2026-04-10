import { Container } from "@/components/Container";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <Container className="py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {subtitle}
          </p>
        ) : null}
      </Container>
    </div>
  );
}

