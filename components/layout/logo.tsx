import { cn } from "@/lib/cn";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
        <Image
          src="/images/ismaya-farm-logo-hi.png"
          alt="Ismaya Farm Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-ink text-white">
            Ismaya Farm Bandung
          </span>
          <span className="mt-0.5 truncate text-[11px] text-subtle-dark">
            Manajemen Peternakan
          </span>
        </span>
      ) : null}
    </div>
  );
}
