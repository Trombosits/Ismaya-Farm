import { RotateCw, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Gagal memuat data",
  description = "Data belum dapat ditampilkan. Silakan coba lagi.",
  onRetry,
  retryLabel = "Coba Lagi",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-border bg-panel px-6 py-12 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full bg-danger-soft text-danger"
      >
        <TriangleAlert className="size-4" />
      </span>
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw aria-hidden className="size-3.5" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
