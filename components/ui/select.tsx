import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border-strong bg-surface pr-8 pl-2.5 text-sm text-ink",
          "transition-colors hover:border-muted/50",
          "focus-visible:border-brand-600",
          "disabled:cursor-not-allowed disabled:bg-panel disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-subtle"
      />
    </div>
  );
}
