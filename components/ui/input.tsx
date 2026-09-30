import { cn } from "@/lib/cn";

export function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-9 w-full rounded-md border border-border-strong bg-surface px-2.5 text-sm text-ink",
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
