"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import {
  REPORT_CATEGORIES,
  reportCatalog,
  type ReportCategory,
} from "@/lib/reports";

type CategoryFilter = "Semua" | ReportCategory;

const TABS = [
  { value: "Semua", label: "Semua" },
  ...REPORT_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  })),
];

export default function ReportsPage() {
  const [category, setCategory] = useState<CategoryFilter>("Semua");

  const reports =
    category === "Semua"
      ? reportCatalog
      : reportCatalog.filter((report) => report.category === category);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Laporan"
        description="Analisis data operasional peternakan berdasarkan periode dan kategori."
      />

      <Tabs
        tabs={TABS}
        value={category}
        onValueChange={(value) => setCategory(value as CategoryFilter)}
        aria-label="Kategori laporan"
      />

      {reports.length === 0 ? (
        <EmptyState
          title="Belum ada laporan"
          description="Belum ada laporan pada kategori ini."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
          {reports.map((report) => (
            <li key={report.slug}>
              <Link
                href={`/reports/${report.slug}`}
                className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-panel"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {report.title}
                    </span>
                    <Badge variant="neutral">{report.category}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {report.description}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700">
                  Buka
                  <ArrowRight aria-hidden className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
