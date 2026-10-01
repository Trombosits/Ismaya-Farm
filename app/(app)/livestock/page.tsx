"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, SearchX } from "lucide-react";

import { LivestockFormDialog } from "@/components/livestock/livestock-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
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

export default function LivestockPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Livestock | null>(null);
  const [deleting, setDeleting] = useState<Livestock | null>(null);

  const normalized = query.trim().toLowerCase();
  const breedOptions =
    speciesFilter === "all"
      ? breedList
      : getBreedsBySpecies(speciesFilter);

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
  const isSearchEmpty = isFiltered && filtered.length === 0;

  function handleQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleSpeciesFilter(value: string) {
    setSpeciesFilter(value);
    setBreedFilter("all");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Data Ternak"
        description="Registri pusat ternak yang teridentifikasi secara individual, lengkap dengan jenis, ras, dan statusnya."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            Tambah Ternak
          </Button>
        }
      />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={handleQuery}
            placeholder="Cari tag, jenis, atau ras…"
            aria-label="Cari ternak berdasarkan tag, jenis, atau ras"
            className="w-full sm:max-w-xs"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-40">
              <Select
                aria-label="Filter jenis ternak"
                value={speciesFilter}
                onChange={(event) =>
                  handleSpeciesFilter(event.target.value)
                }
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

      {viewState === "loading" ? (
        <TableSkeleton rows={8} columns={7} />
      ) : viewState === "error" ? (
        <ErrorState onRetry={() => setViewState("data")} />
      ) : viewState === "empty" ? (
        <EmptyState
          title="Belum ada data ternak"
          description="Belum ada ternak yang terdaftar. Tambahkan ternak pertama Anda."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden className="size-4" />
              Tambah Ternak
            </Button>
          }
        />
      ) : isSearchEmpty ? (
        <EmptyState
          icon={<SearchX className="size-4" />}
          title="Tidak ada data yang sesuai"
          description="Coba ubah kata pencarian atau filter yang digunakan."
        />
      ) : (
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
                    onEdit={() => setEditing(animal)}
                    onDelete={() => setDeleting(animal)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {viewState === "data" && !isSearchEmpty ? (
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      {addOpen ? (
        <LivestockFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <LivestockFormDialog
          open
          mode="edit"
          livestock={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Data Ternak?"
          description={`Apakah Anda yakin ingin menghapus data ternak "${deleting.tag_code}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
