export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <span className="h-5 w-32 animate-pulse rounded-sm bg-border" />
        <span className="h-3.5 w-80 animate-pulse rounded-sm bg-border/70" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className="h-[88px] animate-pulse rounded-md bg-border/60"
          />
        ))}
      </div>
      <span className="h-40 animate-pulse rounded-md bg-border/60" />
      <span className="h-52 animate-pulse rounded-md bg-border/60" />
      <div className="grid gap-4 lg:grid-cols-2">
        <span className="h-36 animate-pulse rounded-md bg-border/60" />
        <span className="h-36 animate-pulse rounded-md bg-border/60" />
      </div>
    </div>
  );
}
