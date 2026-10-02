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
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  breedList,
  getBreedsBySpecies,
  getSpeciesName,
  SEX_LABEL,
  speciesList,
  type LivestockSex,
} from "@/lib/livestock";
import {
  aggregateByMonth,
  countBy,
  DEFAULT_PERIOD,
  monthLabel,
  mortalityEvents,
  REFERENCE_DATE,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function LivestockMortalityReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);
  const breedOptions =
    speciesFilter === "all" ? breedList : getBreedsBySpecies(speciesFilter);

  const events = mortalityEvents.filter((event) => {
    const matchesPeriod = withinRange(event.event_date, range);
    const matchesSpecies =
      speciesFilter === "all" || event.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || event.breed_id === breedFilter;
    const matchesSex = sexFilter === "all" || event.sex === sexFilter;
    return matchesPeriod && matchesSpecies && matchesBreed && matchesSex;
  });

  const referenceMonth = `${REFERENCE_DATE.getFullYear()}-${String(
    REFERENCE_DATE.getMonth() + 1,
  ).padStart(2, "0")}`;
  const thisMonthCount = events.filter((event) =>
    event.event_date.startsWith(referenceMonth),
  ).length;

  const bySpecies = countBy(events, (event) =>
    getSpeciesName(event.species_id),
  );
  const topSpecies = bySpecies[0]?.key ?? "—";

  const trend = aggregateByMonth(
    events,
    (event) => event.event_date,
    range,
  );
  const speciesChart = bySpecies.map((entry) => ({
    label: entry.key,
    value: entry.count,
  }));

  const grouped = new Map<
    string,
    { month: string; species: string; count: number }
  >();
  for (const event of events) {
    const month = event.event_date.slice(0, 7);
    const species = getSpeciesName(event.species_id);
    const key = `${month}|${species}`;
    const entry = grouped.get(key) ?? { month, species, count: 0 };
    entry.count += 1;
    grouped.set(key, entry);
  }
  const tableRows = [...grouped.values()].sort((a, b) =>
    a.month === b.month ? b.count - a.count : a.month < b.month ? 1 : -1,
  );

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Tren Kematian Ternak"
        description="Analisis kematian ternak per periode dan jenis ternak (data simulasi frontend)."
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
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard label="Total Kematian" value={events.length} accent="danger" />
        <SummaryCard label="Kematian Bulan Ini" value={thisMonthCount} />
        <SummaryCard
          label="Jenis Terbanyak"
          value={topSpecies}
          hint="Jenis ternak dengan kematian terbanyak"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={events.length === 0}
        emptyTitle="Belum ada data kematian"
        emptyDescription="Belum ada data kematian pada filter/periode yang dipilih."
      >
        <ReportSection
          title="Tren Kematian Ternak"
          description="Agregasi bulanan jumlah kematian."
        >
          <LineChart data={trend} tone="danger" />
        </ReportSection>

        <ReportSection title="Kematian Berdasarkan Jenis Ternak">
          <BarChart data={speciesChart} tone="danger" />
        </ReportSection>

        <ReportSection title="Ringkasan per Periode & Jenis">
          <Table className="min-w-[560px]">
            <THead>
              <tr>
                <TH>Periode</TH>
                <TH>Jenis Ternak</TH>
                <TH className="text-right">Jumlah Kematian</TH>
              </tr>
            </THead>
            <TBody>
              {tableRows.map((row) => (
                <TR key={`${row.month}-${row.species}`}>
                  <TD className="whitespace-nowrap text-muted">
                    {monthLabel(row.month)}
                  </TD>
                  <TD className="font-medium">{row.species}</TD>
                  <TD className="text-right">{row.count}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
