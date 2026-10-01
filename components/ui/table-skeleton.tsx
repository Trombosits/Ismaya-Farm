import { cn } from "@/lib/cn";

const COLUMN_WIDTHS = ["10%", "22%", "16%", "15%", "8%"];

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
  className,
}: TableSkeletonProps) {
  const widths = Array.from(
    { length: columns },
    (_, index) => COLUMN_WIDTHS[index % COLUMN_WIDTHS.length],
  );

  return (
    <div
      role="status"
      aria-busy
      className={cn(
        "overflow-hidden rounded-md border border-border",
        className,
      )}
    >
      <span className="sr-only">Memuat data…</span>
      <div aria-hidden className="flex items-center gap-4 border-b border-border bg-panel px-3 py-2.5">
        {widths.map((width, index) => (
          <span
            key={index}
            className="h-2.5 animate-pulse rounded-sm bg-border"
            style={{ width }}
          />
        ))}
      </div>
      <div aria-hidden className="divide-y divide-border bg-surface">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-3 py-3">
            {widths.map((width, columnIndex) => (
              <span
                key={columnIndex}
                className="h-3 animate-pulse rounded-sm bg-border/70"
                style={{ width }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
