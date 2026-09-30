import { Sprout } from "lucide-react";

import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white"
      >
        <Sprout className="size-4" strokeWidth={2.25} />
      </span>
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-ink">
            ISMAYA
          </span>
          <span className="mt-0.5 truncate text-[11px] text-subtle">
            Manajemen Peternakan
          </span>
        </span>
      ) : null}
    </div>
  );
}
