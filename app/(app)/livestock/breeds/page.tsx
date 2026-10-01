"use client";

import { useState } from "react";
import { Plus, SearchX } from "lucide-react";

import { BreedFormDialog } from "@/components/livestock/breed-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
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
  formatDate,
  getSpeciesName,
  speciesList,
  type LivestockBreed,
} from "@/lib/livestock";

const PAGE_SIZE = 10;

export default function BreedsPage() {
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<LivestockBreed | null>(null);
  const [deleting, setDeleting] = useState<LivestockBreed | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = breedList.filter((breed) => {
    const matchesSpecies =
      speciesFilter === "all" || breed.species_id === speciesFilter;
    const matchesQuery =
      breed.name.toLowerCase().includes(normalized) ||
      breed.code.toLowerCase().includes(normalized) ||
      getSpeciesName(breed.species_id).toLowerCase().includes(normalized);
    return matchesSpecies && matchesQuery;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const isFiltered = normalized.length > 0 || speciesFilter !== "all";
  const isSearchEmpty = isFiltered && filtered.length === 0;

  function handleQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleSpeciesFilter(value: string) {
    setSpeciesFilter(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Ras Ternak"
        description="Master data ras ternak yang terhubung ke masing-masing jenis ternak."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            Tambah Ras Ternak
          </Button>
        }
      />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={handleQuery}
            placeholder="Cari ras ternak…"
            aria-label="Cari ras ternak berdasarkan nama, kode, atau jenis ternak"
            className="sm:max-w-xs"
          />
          <div className="w-full sm:w-52">
            <Select
              aria-label="Filter jenis ternak"
              value={speciesFilter}
              onChange={(event) => handleSpeciesFilter(event.target.value)}
            >
              <option value="all">Semua Jenis Ternak</option>
              {speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </Select>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      {viewState === "loading" ? (
        <TableSkeleton rows={8} columns={6} />
      ) : viewState === "error" ? (
        <ErrorState onRetry={() => setViewState("data")} />
      ) : viewState === "empty" ? (
        <EmptyState
          title="Belum ada ras ternak"
          description="Belum ada data ras ternak yang tersedia."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden className="size-4" />
              Tambah Ras Ternak
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
        <Table>
          <THead>
            <tr>
              <TH className="w-24">Kode</TH>
              <TH>Nama</TH>
              <TH>Jenis Ternak</TH>
              <TH className="hidden md:table-cell">Dibuat</TH>
              <TH className="hidden lg:table-cell">Diperbarui</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((breed) => (
              <TR key={breed.id}>
                <TD className="font-mono text-xs text-muted">{breed.code}</TD>
                <TD className="font-medium">{breed.name}</TD>
                <TD className="text-muted">
                  {getSpeciesName(breed.species_id)}
                </TD>
                <TD className="hidden text-xs text-muted md:table-cell">
                  {formatDate(breed.created_at)}
                </TD>
                <TD className="hidden text-xs text-muted lg:table-cell">
                  {formatDate(breed.updated_at)}
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${breed.name}`}
                    onEdit={() => setEditing(breed)}
                    onDelete={() => setDeleting(breed)}
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
        <BreedFormDialog open mode="create" onClose={() => setAddOpen(false)} />
      ) : null}

      {editing ? (
        <BreedFormDialog
          open
          mode="edit"
          breed={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Ras Ternak?"
          description={`Apakah Anda yakin ingin menghapus ras "${deleting.name}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
