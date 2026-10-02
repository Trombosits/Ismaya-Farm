"use client";

import Link from "next/link";
import { ChevronRight, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { cn } from "@/lib/cn";
import {
  PERIOD_LABEL,
  type PeriodPreset,
  type ReportPeriod,
} from "@/lib/reports";
import type { TableViewState } from "@/lib/view-state";

export function ExportPrintActions() {
  return (
    <div
      className="flex items-center gap-2"
      title="Export & Print — segera tersedia"
    >
      <Button variant="secondary" size="sm" disabled>
        <Download aria-hidden className="size-3.5" />
        Export
      </Button>
      <Button variant="secondary" size="sm" disabled>
        <Printer aria-hidden className="size-3.5" />
        Print
      </Button>
    </div>
  );
}

export function ReportHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-xs text-muted"
      >
        <Link href="/reports" className="transition-colors hover:text-ink">
          Laporan
        </Link>
        <ChevronRight aria-hidden className="size-3.5 text-subtle" />
        <span className="text-ink">{title}</span>
      </nav>
      <PageHeader
        title={title}
        description={description}
        actions={<ExportPrintActions />}
      />
    </div>
  );
}

export function ReportFilters({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ReportPeriodFilter({
  value,
  onChange,
}: {
  value: ReportPeriod;
  onChange: (value: ReportPeriod) => void;
}) {
  return (
    <>
      <div className="w-full sm:w-44">
        <Select
          aria-label="Periode laporan"
          value={value.preset}
          onChange={(event) =>
            onChange({
              ...value,
              preset: event.target.value as PeriodPreset,
            })
          }
        >
          {(Object.keys(PERIOD_LABEL) as PeriodPreset[]).map((preset) => (
            <option key={preset} value={preset}>
              {PERIOD_LABEL[preset]}
            </option>
          ))}
        </Select>
      </div>
      {value.preset === "custom" ? (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            type="date"
            aria-label="Dari tanggal"
            value={value.from}
            onChange={(event) =>
              onChange({ ...value, from: event.target.value })
            }
            className="sm:w-36"
          />
          <span aria-hidden className="text-subtle">
            –
          </span>
          <Input
            type="date"
            aria-label="Sampai tanggal"
            value={value.to}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
            className="sm:w-36"
          />
        </div>
      ) : null}
    </>
  );
}

export function ReportSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-md border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ReportStatePanel({
  state,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
}: {
  state: TableViewState;
  onRetry: () => void;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  if (state === "loading") {
    return <TableSkeleton rows={7} columns={6} />;
  }
  if (state === "error") {
    return <ErrorState onRetry={onRetry} />;
  }
  if (state === "empty" || isEmpty) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }
  return <>{children}</>;
}
