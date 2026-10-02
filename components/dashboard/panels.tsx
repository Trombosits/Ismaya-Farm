import Link from "next/link";

import { cn } from "@/lib/cn";
import type {
  ActivityItem,
  AttentionItem,
  AttentionSeverity,
  OperationalStat,
} from "@/lib/dashboard";

const severityDot: Record<AttentionSeverity, string> = {
  critical: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
};

const severityLabel: Record<AttentionSeverity, string> = {
  critical: "Prioritas",
  warning: "Perhatian",
  info: "Informasi",
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
        Tidak ada kondisi yang memerlukan perhatian saat ini.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              aria-hidden
              title={severityLabel[item.severity]}
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                severityDot[item.severity],
              )}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="text-xs text-muted">{item.description}</p>
            </div>
          </div>
          <Link
            href={item.href}
            className="shrink-0 self-start text-xs font-medium text-brand-700 hover:underline sm:self-auto"
          >
            {item.actionLabel} →
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
        Belum ada aktivitas terbaru.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 px-3.5 py-2.5">
          <span className="w-20 shrink-0 text-[11px] text-subtle">
            {item.relative}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink">{item.title}</p>
            <p className="truncate text-xs text-muted">{item.reference}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OperationalPanel({
  title,
  actionLabel,
  href,
  stats,
}: {
  title: string;
  actionLabel: string;
  href: string;
  stats: OperationalStat[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
        >
          {actionLabel} →
        </Link>
      </div>
      <dl className="flex flex-col gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="text-xs text-muted">{stat.label}</dt>
            <dd className="text-sm font-semibold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
