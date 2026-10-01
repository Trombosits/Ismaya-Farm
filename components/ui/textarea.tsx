import { cn } from "@/lib/cn";

export function Textarea({
  className,
  rows = 3,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full resize-y rounded-md border border-border-strong bg-surface px-2.5 py-2 text-sm text-ink",
        "placeholder:text-subtle",
        "transition-colors hover:border-muted/50",
        "focus-visible:border-brand-600",
        "disabled:cursor-not-allowed disabled:bg-panel disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
