"use client";

import { useState } from "react";

import { BarChart } from "@/components/reports/charts";
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
  ACQUISITION_LABEL,
  breedList,
  formatAge,
  formatDate,
  getBreedName,
  getBreedsBySpecies,
  getSpeciesName,
  livestockList,
  SEX_LABEL,
  speciesList,
  STATUS_BADGE,
  STATUS_LABEL,
  type AcquisitionType,
  type LivestockSex,
  type LivestockStatus,
} from "@/lib/livestock";
import {
  countBy,
  DEFAULT_PERIOD,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function LivestockDataReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [acquisitionFilter, setAcquisitionFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);
  const breedOptions =
    speciesFilter === "all" ? breedList : getBreedsBySpecies(speciesFilter);

  const rows = livestockList.filter((animal) => {
    const matchesPeriod = withinRange(animal.acquisition_date, range);
    const matchesSpecies =
      speciesFilter === "all" || animal.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || animal.breed_id === breedFilter;
    const matchesSex = sexFilter === "all" || animal.sex === sexFilter;
    const matchesStatus =
      statusFilter === "all" || animal.status === statusFilter;
    const matchesAcquisition =
      acquisitionFilter === "all" ||
      animal.acquisition_type === acquisitionFilter;
    return (
      matchesPeriod &&
      matchesSpecies &&
      matchesBreed &&
      matchesSex &&
      matchesStatus &&
      matchesAcquisition
    );
  });

  const statusCounts = countBy(rows, (animal) => animal.status);
  const countFor = (status: LivestockStatus) =>
    statusCounts.find((entry) => entry.key === status)?.count ?? 0;

  const statusChart = statusCounts.map((entry) => ({
    label: STATUS_LABEL[entry.key as LivestockStatus],
    value: entry.count,
  }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Data Ternak"
        description="Laporan rincian registri ternak individual beserta status dan tipe perolehannya."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <div className="sm:w-40">
            <Select
              aria-label="Filter jenis ternak"
              value={speciesFilter}
              onChange={(event) => {
                setSpeciesFilter(event.target.value);
                setBreedFilter("all");
              }}
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
              aria-label="Filter ras"
              value={breedFilter}
              onChange={(event) => setBreedFilter(event.target.value)}
            >
              <option value="all">Semua Ras</option>
              {breedOptions.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-36">
            <Select
              aria-label="Filter jenis kelamin"
              value={sexFilter}
              onChange={(event) => setSexFilter(event.target.value)}
            >
              <option value="all">Semua Kelamin</option>
              {(Object.keys(SEX_LABEL) as LivestockSex[]).map((sex) => (
                <option key={sex} value={sex}>
                  {SEX_LABEL[sex]}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-36">
            <Select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Semua Status</option>
              {(Object.keys(STATUS_LABEL) as LivestockStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-44">
            <Select
              aria-label="Filter tipe perolehan"
              value={acquisitionFilter}
              onChange={(event) => setAcquisitionFilter(event.target.value)}
            >
              <option value="all">Semua Perolehan</option>
              {(Object.keys(ACQUISITION_LABEL) as AcquisitionType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {ACQUISITION_LABEL[type]}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards columns={4}>
        <SummaryCard label="Total Ternak" value={rows.length} />
        <SummaryCard
          label="Ternak Aktif"
          value={countFor("active")}
          accent="success"
        />
        <SummaryCard label="Ternak Dijual" value={countFor("sold")} accent="info" />
        <SummaryCard label="Ternak Mati" value={countFor("dead")} accent="danger" />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={rows.length === 0}
        emptyTitle="Belum ada data ternak"
        emptyDescription="Belum ada data ternak pada filter/periode yang dipilih."
      >
        <ReportSection title="Komposisi Status">
          <BarChart data={statusChart} tone="brand" />
        </ReportSection>

        <ReportSection title="Daftar Ternak">
          <Table className="min-w-[920px]">
            <THead>
              <tr>
                <TH>Tag Code</TH>
                <TH>Jenis Ternak</TH>
                <TH>Ras</TH>
                <TH>Jenis Kelamin</TH>
                <TH>Tanggal Lahir</TH>
                <TH>Umur</TH>
                <TH>Tanggal Perolehan</TH>
                <TH>Tipe Perolehan</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((animal) => (
                <TR key={animal.id}>
                  <TD className="font-mono text-[13px] font-semibold text-ink">
                    {animal.tag_code}
                  </TD>
                  <TD>{getSpeciesName(animal.species_id)}</TD>
                  <TD className="text-muted">
                    {getBreedName(animal.breed_id)}
                  </TD>
                  <TD>{SEX_LABEL[animal.sex]}</TD>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(animal.birth_date)}
                  </TD>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatAge(animal.birth_date)}
                  </TD>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(animal.acquisition_date)}
                  </TD>
                  <TD className="text-muted">
                    {ACQUISITION_LABEL[animal.acquisition_type]}
                  </TD>
                  <TD>
                    <Badge variant={STATUS_BADGE[animal.status]}>
                      {STATUS_LABEL[animal.status]}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
