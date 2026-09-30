import Link from "next/link";

import { cn } from "@/lib/cn";
import type { NavItem as NavItemType } from "@/lib/navigation";

import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  item: NavItemType;
  active?: boolean;
  onNavigate?: () => void;
}

export function NavItem({ item, active = false, onNavigate }: NavItemProps) {
  const Icon = item.icon;

  if (item.status === "coming-soon") {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        title="Segera hadir"
        className="group flex h-8 w-full cursor-not-allowed items-center gap-2.5 rounded-md px-2 text-left text-sm text-subtle/80"
      >
        <Icon aria-hidden className="size-4 shrink-0 text-subtle/70" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <Badge variant="neutral" className="shrink-0">
          Segera
        </Badge>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
        active
          ? "bg-brand-50 font-medium text-brand-700"
          : "text-muted hover:bg-canvas hover:text-ink",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute top-1/2 -left-2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-600"
        />
      ) : null}
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}
