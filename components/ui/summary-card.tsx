import { cn } from "@/lib/cn";

export type SummaryAccent =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

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

const accentStyles: Record<SummaryAccent, string> = {
  brand: "bg-brand-600",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: SummaryAccent;
  children?: React.ReactNode;
  className?: string;
}

export function SummaryCard({
  label,
  value,
  hint,
  accent = "brand",
  children,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[88px] min-w-0 flex-col justify-center gap-1.5 overflow-hidden rounded-md border border-border bg-surface py-3.5 pr-4 pl-4",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", accentStyles[accent])}
      />
      <span className="truncate text-[11px] font-semibold tracking-wider text-muted uppercase">
        {label}
      </span>
      <span className="text-2xl leading-none font-semibold tracking-tight text-ink">
        {value}
      </span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      {children}
    </div>
  );
}
