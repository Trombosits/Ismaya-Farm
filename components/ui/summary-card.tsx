import { cn } from "@/lib/cn";

interface SummaryCardsProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnStyles: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function SummaryCards({
  children,
  columns = 3,
  className,
}: SummaryCardsProps) {
  return (
    <div className={cn("grid gap-3", columnStyles[columns], className)}>
      {children}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SummaryCard({
  label,
  value,
  hint,
  children,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-md border border-border bg-surface px-3.5 py-3",
        className,
      )}
    >
      <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
        {label}
      </span>
      <span className="text-lg leading-tight font-semibold text-ink">
        {value}
      </span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      {children}
    </div>
  );
}
