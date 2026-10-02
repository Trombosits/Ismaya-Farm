import { cn } from "@/lib/cn";

interface DataSectionHeadingProps {
  title: string;
  className?: string;
}

/**
 * Small heading + hairline divider that marks the start of a data/table
 * section, visually separating it from the summary cards above.
 */
export function DataSectionHeading({
  title,
  className,
}: DataSectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-3 pt-1", className)}>
      <h2 className="shrink-0 text-sm font-semibold text-ink">{title}</h2>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
