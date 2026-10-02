"use client";

import { useState } from "react";

import { BarChart, LineChart } from "@/components/reports/charts";
import {
  ReportFilters,
  ReportHeader,
  ReportPeriodFilter,
  ReportSection,
  ReportStatePanel,
} from "@/components/reports/report-ui";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import {
  getResultsByBatch,
  HATCHERY_STATUS_BADGE,
  HATCHERY_STATUS_LABEL,
  hatcheryBatches,
  type HatcheryBatchStatus,
} from "@/lib/hatchery";
import { formatDate, getSpeciesName, speciesList } from "@/lib/livestock";
import {
  aggregateByMonth,
  DEFAULT_PERIOD,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function HatcheryReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const domainFiltered = hatcheryBatches.filter((batch) => {
    const matchesSpecies =
      speciesFilter === "all" || batch.species_id === speciesFilter;
    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;
    return matchesSpecies && matchesStatus;
  });

  const batches = domainFiltered.filter((batch) =>
    withinRange(batch.start_date, range),
  );

  const totalEggs = batches.reduce((sum, batch) => sum + batch.egg_quantity, 0);
  const incubating = domainFiltered.filter(
    (batch) => batch.status === "incubating",
  ).length;

  const resultRows = batches.flatMap((batch) =>
    getResultsByBatch(batch.id).map((result) => ({ batch, result })),
  );

  const totalHatched = resultRows.reduce(
    (sum, entry) => sum + entry.result.hatched_count,
    0,
  );
  const totalFailed = resultRows.reduce(
    (sum, entry) => sum + entry.result.failed_count,
    0,
  );
  const totalSurvival = resultRows.reduce(
    (sum, entry) => sum + entry.result.survival_count,
    0,
  );

  const trend = aggregateByMonth(
    resultRows,
    (entry) => entry.result.hatch_date,
    range,
    (entry) => entry.result.hatched_count,
  );

  const composition = [
    { label: "Menetas", value: totalHatched },
    { label: "Gagal", value: totalFailed },
    { label: "Survival", value: totalSurvival },
  ];

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Hasil Penetasan"
        description="Ringkasan batch penetasan, candling, dan hasil menetas/survival."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <div className="sm:w-40">
            <Select
              aria-label="Filter jenis ternak"
              value={speciesFilter}
              onChange={(event) => setSpeciesFilter(event.target.value)}
            >
              <option value="all">Semua Jenis</option>
              {speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-40">
            <Select
              aria-label="Filter status batch"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Semua Status</option>
              {(Object.keys(HATCHERY_STATUS_LABEL) as HatcheryBatchStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {HATCHERY_STATUS_LABEL[status]}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards columns={4}>
        <SummaryCard label="Total Batch" value={batches.length} />
        <SummaryCard label="Total Telur" value={formatNumber(totalEggs)} />
        <SummaryCard
          label="Total Menetas"
          value={formatNumber(totalHatched)}
          accent="success"
        />
        <SummaryCard
          label="Batch Berjalan"
          value={incubating}
          accent="info"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={batches.length === 0}
        emptyTitle="Belum ada batch penetasan"
        emptyDescription="Belum ada batch penetasan pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Hasil Penetasan" description="Menetas per bulan.">
            <LineChart data={trend} tone="success" />
          </ReportSection>
          <ReportSection title="Komposisi Hasil">
            <BarChart data={composition} tone="brand" />
          </ReportSection>
        </div>

        <ReportSection title="Daftar Batch Penetasan">
          <Table className="min-w-[1040px]">
            <THead>
              <tr>
                <TH>Batch Code</TH>
                <TH>Jenis Ternak</TH>
                <TH>Tanggal Mulai</TH>
                <TH className="text-right">Jumlah Telur</TH>
                <TH>Perkiraan Menetas</TH>
                <TH className="text-right">Menetas</TH>
                <TH className="text-right">Gagal</TH>
                <TH className="text-right">Survival</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {batches.map((batch) => {
                const result = getResultsByBatch(batch.id)[0];
                return (
                  <TR key={batch.id}>
                    <TD className="font-mono text-[13px] font-semibold text-ink">
                      {batch.batch_code}
                    </TD>
                    <TD>{getSpeciesName(batch.species_id)}</TD>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(batch.start_date)}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(batch.egg_quantity)}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(batch.expected_hatch_date)}
                    </TD>
                    <TD className="text-right">
                      {result ? formatNumber(result.hatched_count) : "—"}
                    </TD>
                    <TD className="text-right">
                      {result ? formatNumber(result.failed_count) : "—"}
                    </TD>
                    <TD className="text-right">
                      {result ? formatNumber(result.survival_count) : "—"}
                    </TD>
                    <TD>
                      <Badge variant={HATCHERY_STATUS_BADGE[batch.status]}>
                        {HATCHERY_STATUS_LABEL[batch.status]}
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
