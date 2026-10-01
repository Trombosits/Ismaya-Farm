import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <span className="h-5 w-32 animate-pulse rounded-sm bg-border" />
        <span className="h-3.5 w-80 animate-pulse rounded-sm bg-border/70" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <span className="h-9 w-full animate-pulse rounded-md bg-border/70 sm:max-w-xs" />
        <span className="h-9 w-full animate-pulse rounded-md bg-border/70 sm:w-52" />
      </div>
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
