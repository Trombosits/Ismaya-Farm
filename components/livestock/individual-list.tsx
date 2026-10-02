"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import {
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
  type Livestock,
  type LivestockSex,
  type LivestockStatus,
} from "@/lib/livestock";

const PAGE_SIZE = 10;

interface IndividualListProps {
  onCreate: () => void;
  onEdit: (animal: Livestock) => void;
  onDelete: (animal: Livestock) => void;
}

export function IndividualList({
  onCreate,
  onEdit,
  onDelete,
}: IndividualListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");

  const normalized = query.trim().toLowerCase();
  const breedOptions =
    speciesFilter === "all" ? breedList : getBreedsBySpecies(speciesFilter);

  const isFiltered =
    normalized.length > 0 ||
    speciesFilter !== "all" ||
    breedFilter !== "all" ||
    sexFilter !== "all" ||
    statusFilter !== "all";

  const filtered = livestockList.filter((animal) => {
    const matchesQuery =
      normalized.length === 0 ||
      animal.tag_code.toLowerCase().includes(normalized) ||
      getSpeciesName(animal.species_id).toLowerCase().includes(normalized) ||
      getBreedName(animal.breed_id).toLowerCase().includes(normalized);
    const matchesSpecies =
      speciesFilter === "all" || animal.species_id === speciesFilter;
    const matchesBreed =
      breedFilter === "all" || animal.breed_id === breedFilter;
    const matchesSex = sexFilter === "all" || animal.sex === sexFilter;
    const matchesStatus =
      statusFilter === "all" || animal.status === statusFilter;
    return (
      matchesQuery && matchesSpecies && matchesBreed && matchesSex && matchesStatus
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  const activeCount = filtered.filter(
    (animal) => animal.status === "active",
  ).length;
  const maleCount = filtered.filter((animal) => animal.sex === "male").length;
  const femaleCount = filtered.filter(
    (animal) => animal.sex === "female",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <SummaryCards>
        <SummaryCard label="Total Ternak" value={filtered.length} />
        <SummaryCard
          label="Ternak Aktif"
          value={activeCount}
          accent="success"
        />
        <SummaryCard
          label="Komposisi Jenis Kelamin"
          value={
            <span className="text-base">
              Jantan {maleCount} · Betina {femaleCount}
            </span>
          }
        />
      </SummaryCards>

      <DataSectionHeading title="Daftar Ternak" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari tag, jenis, atau ras…"
            aria-label="Cari ternak berdasarkan tag, jenis, atau ras"
            className="w-full sm:max-w-xs"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-40">
              <Select
                aria-label="Filter jenis ternak"
                value={speciesFilter}
                onChange={(event) => {
                  setSpeciesFilter(event.target.value);
                  setBreedFilter("all");
                  setPage(1);
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
                disabled={breedOptions.length === 0}
                onChange={(event) => {
                  setBreedFilter(event.target.value);
                  setPage(1);
                }}
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
                onChange={(event) => {
                  setSexFilter(event.target.value);
                  setPage(1);
                }}
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
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                {(Object.keys(STATUS_LABEL) as LivestockStatus[]).map(
                  (status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ),
                )}
              </Select>
            </div>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={7}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada data ternak"
        emptyDescription="Belum ada ternak yang terdaftar. Tambahkan ternak pertama Anda."
        emptyAction={
          <Button onClick={onCreate}>
            <Plus aria-hidden className="size-4" />
            Tambah Ternak
          </Button>
        }
        pagination={
          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        <Table className="min-w-[720px]">
          <THead>
            <tr>
              <TH>Tag Code</TH>
              <TH>Jenis</TH>
              <TH>Ras</TH>
              <TH className="hidden md:table-cell">Jenis Kelamin</TH>
              <TH>Umur</TH>
              <TH>Status</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((animal) => (
              <TR key={animal.id}>
                <TD>
                  <Link
                    href={`/livestock/${animal.id}`}
                    className="font-mono text-[13px] font-semibold text-ink transition-colors hover:text-brand-700"
                  >
                    {animal.tag_code}
                  </Link>
                </TD>
                <TD>{getSpeciesName(animal.species_id)}</TD>
                <TD className="text-muted">
                  {getBreedName(animal.breed_id)}
                </TD>
                <TD className="hidden md:table-cell">
                  {SEX_LABEL[animal.sex]}
                </TD>
                <TD>
                  <div className="flex flex-col">
                    <span>{formatAge(animal.birth_date)}</span>
                    <span className="text-[11px] text-subtle">
                      {formatDate(animal.birth_date)}
                    </span>
                  </div>
                </TD>
                <TD>
                  <Badge variant={STATUS_BADGE[animal.status]}>
                    {STATUS_LABEL[animal.status]}
                  </Badge>
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${animal.tag_code}`}
                    onView={() => router.push(`/livestock/${animal.id}`)}
                    onEdit={() => onEdit(animal)}
                    onDelete={() => onDelete(animal)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>
    </div>
  );
}
