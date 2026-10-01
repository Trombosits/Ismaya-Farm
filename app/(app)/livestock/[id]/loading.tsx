export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <span className="h-3.5 w-28 animate-pulse rounded-sm bg-border/70" />
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <span className="h-5 w-32 animate-pulse rounded-sm bg-border" />
        <span className="h-3.5 w-56 animate-pulse rounded-sm bg-border/70" />
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <span className="h-2.5 w-20 animate-pulse rounded-sm bg-border" />
            <span className="h-3.5 w-28 animate-pulse rounded-sm bg-border/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
