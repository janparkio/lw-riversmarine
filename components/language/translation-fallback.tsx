import { cn } from "@/lib/utils";

type TranslationFallbackProps = {
  title: string;
  description: string;
  className?: string;
};

export function TranslationFallback({
  title,
  description,
  className,
}: TranslationFallbackProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100 px-4 py-3 text-sm space-y-1",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold">{title}</p>
      <p className="text-xs md:text-sm text-amber-900/80 dark:text-amber-100/90">
        {description}
      </p>
    </div>
  );
}
