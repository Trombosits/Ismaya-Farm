import { Inbox } from "lucide-react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-border-strong bg-panel px-6 py-12 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full bg-canvas text-subtle"
      >
        {icon ?? <Inbox className="size-4" />}
      </span>
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
