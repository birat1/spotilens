import Link from 'next/link';

export function NavigationCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 rounded-xl bg-card hover:bg-muted border border-border transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-sm"
    >
      <h3 className="font-bold text-lg text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mt-1">
        {description}
      </p>
    </Link>
  );
}
