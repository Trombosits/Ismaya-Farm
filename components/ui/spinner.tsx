import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden
      className={cn("size-4 animate-spin text-muted", className)}
    />
  );
}

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "Memuat…",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 py-10 text-sm text-muted",
        className,
      )}
    >
      <Spinner />
      {label}
    </div>
  );
}
