import { cn } from "@/lib/cn";

interface DescriptionListProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnStyles: Record<1 | 2 | 3, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function DescriptionList({
  children,
  columns = 2,
  className,
}: DescriptionListProps) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columnStyles[columns],
        className,
      )}
    >
      {children}
    </dl>
  );
}

interface DescriptionItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function DescriptionItem({
  label,
  children,
  className,
}: DescriptionItemProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <dt className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
        {label}
      </dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}
