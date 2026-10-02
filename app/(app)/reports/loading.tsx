import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <span className="h-3 w-24 animate-pulse rounded-sm bg-border/70" />
        <span className="h-5 w-44 animate-pulse rounded-sm bg-border" />
        <span className="h-3.5 w-80 animate-pulse rounded-sm bg-border/70" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <span
            key={index}
            className="h-[88px] animate-pulse rounded-md bg-border/60"
          />
        ))}
      </div>
      <span className="h-56 animate-pulse rounded-md bg-border/60" />
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
