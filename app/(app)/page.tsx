"use client";

import { useState } from "react";

import {
  AttentionList,
  OperationalPanel,
  RecentActivity,
} from "@/components/dashboard/panels";
import { LineChart } from "@/components/reports/charts";
import { ReportSection } from "@/components/reports/report-ui";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { getDashboardData } from "@/lib/dashboard";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const [viewState, setViewState] = useState<TableViewState>("data");
  const data = getDashboardData();

  const forceEmpty = viewState === "empty";
  const attention = forceEmpty ? [] : data.attention;
  const activities = forceEmpty ? [] : data.activities;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <PageHeader
          title="Ringkasan"
          description="Pantau kondisi operasional peternakan secara keseluruhan."
          actions={
            <TableStatePreview value={viewState} onChange={setViewState} />
          }
        />
        <p className="text-xs text-subtle">
          Data diperbarui: 24 Sep 2026, 09:30
        </p>
      </div>

      {viewState === "loading" ? (
        <DashboardSkeleton />
      ) : viewState === "error" ? (
        <ErrorState onRetry={() => setViewState("data")} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <DataSectionHeading title="Ringkasan Utama" />
            <SummaryCards columns={4}>
              <SummaryCard
                label="Ternak Individu"
                value={formatNumber(data.livestockTotal)}
                hint={`${data.livestockActive} aktif`}
              />
              <SummaryCard
                label="Populasi Batch"
                value={formatNumber(data.batchPopulation)}
                hint={`${data.batchActive} batch aktif`}
                accent="info"
              />
              <SummaryCard
                label="Stok Pakan"
                value={`${data.feedTypeCount} jenis`}
                hint={`${data.feedBelowMinimum} di bawah minimum`}
                accent={data.feedBelowMinimum > 0 ? "danger" : "brand"}
              />
              <SummaryCard
                label="Penjualan"
                value={`${data.salesCount} transaksi`}
                hint={`${formatCurrency(data.salesRevenue)} bulan ini`}
                accent="success"
              />
            </SummaryCards>
          </div>

          <ReportSection
            title="Perlu Perhatian"
            description="Beberapa kondisi yang mungkin memerlukan tindakan."
          >
            <AttentionList items={attention} />
          </ReportSection>

          <ReportSection
            title="Aktivitas Terbaru"
            description="Ringkasan aktivitas operasional terakhir."
            actions={
              <Button variant="ghost" size="sm" disabled>
                Lihat semua
              </Button>
            }
          >
            <RecentActivity items={activities} />
          </ReportSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <OperationalPanel
              title="Reproduksi"
              actionLabel="Lihat Reproduksi"
              href="/livestock/reproduction"
              stats={data.reproduction}
            />
            <OperationalPanel
              title="Penetasan"
              actionLabel="Lihat Penetasan"
              href="/hatchery/batches"
              stats={data.hatchery}
            />
          </div>

          <ReportSection
            title="Tren Penjualan"
            description="Nilai penjualan enam bulan terakhir."
          >
            <LineChart
              data={data.salesTrend}
              tone="success"
              height={180}
              valueFormat={formatCurrency}
            />
          </ReportSection>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy>
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
      <span className="h-56 animate-pulse rounded-md bg-border/60" />
    </div>
  );
}
