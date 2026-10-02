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
import {
  formatDate,
  getLivestockById,
  speciesList,
} from "@/lib/livestock";
import {
  aggregateByMonth,
  countBy,
  DEFAULT_PERIOD,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";
import {
  REPRODUCTION_STATUS_BADGE,
  REPRODUCTION_STATUS_LABEL,
  reproductionRecords,
  type ReproductionStatus,
} from "@/lib/reproduction";

export default function ReproductionReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const domainFiltered = reproductionRecords.filter((record) => {
    const female = getLivestockById(record.female_livestock_id);
    const matchesSpecies =
      speciesFilter === "all" || female?.species_id === speciesFilter;
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    return matchesSpecies && matchesStatus;
  });

  const records = domainFiltered.filter((record) =>
    withinRange(record.mating_date, range),
  );

  const pregnantCount = domainFiltered.filter(
    (record) => record.status === "pregnant",
  ).length;
  const bornCount = domainFiltered.filter(
    (record) => record.status === "born",
  ).length;

  const trend = aggregateByMonth(
    records,
    (record) => record.mating_date,
    range,
  );
  const statusChart = countBy(records, (record) => record.status).map(
    (entry) => ({
      label:
        REPRODUCTION_STATUS_LABEL[entry.key as ReproductionStatus] ?? entry.key,
      value: entry.count,
    }),
  );

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Perkawinan & Kehamilan"
        description="Aktivitas perkawinan, status kebuntingan, dan kelahiran ternak."
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
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Semua Status</option>
              {(Object.keys(REPRODUCTION_STATUS_LABEL) as ReproductionStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {REPRODUCTION_STATUS_LABEL[status]}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard label="Total Perkawinan" value={domainFiltered.length} />
        <SummaryCard
          label="Sedang Bunting"
          value={pregnantCount}
          accent="info"
        />
        <SummaryCard
          label="Sudah Melahirkan"
          value={bornCount}
          accent="success"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={records.length === 0}
        emptyTitle="Belum ada data perkawinan"
        emptyDescription="Belum ada data perkawinan pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Perkawinan" description="Agregasi bulanan.">
            <LineChart data={trend} tone="brand" />
          </ReportSection>
          <ReportSection title="Status Reproduksi">
            <BarChart data={statusChart} tone="brand" />
          </ReportSection>
        </div>

        <ReportSection title="Daftar Perkawinan">
          <Table className="min-w-[900px]">
            <THead>
              <tr>
                <TH>Tanggal Perkawinan</TH>
                <TH>Betina</TH>
                <TH>Jantan</TH>
                <TH>Tanggal Kehamilan</TH>
                <TH>Perkiraan Kelahiran</TH>
                <TH>Kelahiran Aktual</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {records.map((record) => {
                const female = getLivestockById(record.female_livestock_id);
                const male = getLivestockById(record.male_livestock_id);
                return (
                  <TR key={record.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(record.mating_date)}
                    </TD>
                    <TD className="font-mono text-[13px] font-semibold text-ink">
                      {female?.tag_code ?? "—"}
                    </TD>
                    <TD className="font-mono text-[13px] text-muted">
                      {male?.tag_code ?? "—"}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {record.pregnancy_date
                        ? formatDate(record.pregnancy_date)
                        : "—"}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {record.expected_birth_date
                        ? formatDate(record.expected_birth_date)
                        : "—"}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {record.actual_birth_date
                        ? formatDate(record.actual_birth_date)
                        : "—"}
                    </TD>
                    <TD>
                      <Badge
                        variant={REPRODUCTION_STATUS_BADGE[record.status]}
                      >
                        {REPRODUCTION_STATUS_LABEL[record.status]}
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
