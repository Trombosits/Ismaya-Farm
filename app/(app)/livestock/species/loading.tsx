import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <span className="h-5 w-40 animate-pulse rounded-sm bg-border" />
        <span className="h-3.5 w-72 animate-pulse rounded-sm bg-border/70" />
      </div>
      <span className="h-9 w-full max-w-xs animate-pulse rounded-md bg-border/70" />
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
