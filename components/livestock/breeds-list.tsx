"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, SearchX } from "lucide-react";

import { BreedFormDialog } from "@/components/livestock/breed-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { deleteBreed } from "@/lib/actions/breeds";
import { formatDate } from "@/lib/livestock";
import type { BreedRow, SpeciesRow } from "@/lib/supabase/types";

const PAGE_SIZE = 10;

export function BreedsList({
  breeds,
  species,
}: {
  breeds: BreedRow[];
  species: SpeciesRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<BreedRow | null>(null);
  const [deleting, setDeleting] = useState<BreedRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const speciesNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const entry of species) map.set(entry.id, entry.name);
    return map;
  }, [species]);

  const normalized = query.trim().toLowerCase();
  const filtered = breeds.filter((breed) => {
    const speciesName = speciesNameById.get(breed.species_id) ?? "";
    const matchesQuery =
      normalized.length === 0 ||
      breed.name.toLowerCase().includes(normalized) ||
      breed.code.toLowerCase().includes(normalized) ||
      speciesName.toLowerCase().includes(normalized);
    const matchesSpecies =
      speciesFilter === "all" || breed.species_id === Number(speciesFilter);
    return matchesQuery && matchesSpecies;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const isSearchEmpty =
    (normalized.length > 0 || speciesFilter !== "all") && filtered.length === 0;
  const hasNoData = breeds.length === 0;

  function handleDelete() {
    if (!deleting) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteBreed(deleting.id);
      if (result.ok) {
        setDeleting(null);
        router.refresh();
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Ras Ternak"
        description="Master data ras ternak yang terhubung ke masing-masing jenis ternak."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Ras Ternak
          </Button>
        }
      />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari ras ternak…"
            aria-label="Cari ras ternak berdasarkan nama, kode, atau jenis ternak"
            className="sm:max-w-xs"
          />
          <div className="w-full sm:w-52">
            <Select
              aria-label="Filter jenis ternak"
              value={speciesFilter}
              onChange={(event) => {
                setSpeciesFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Semua Jenis Ternak</option>
              {species.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </Select>
          </div>
        </TableToolbarGroup>
      </TableToolbar>

      {hasNoData ? (
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
        <Table className="min-w-[720px]">
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
                  {speciesNameById.get(breed.species_id) ?? "—"}
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
                    onDelete={() => {
                      setDeleteError(null);
                      setDeleting(breed);
                    }}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {!hasNoData && !isSearchEmpty ? (
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      {addOpen ? (
        <BreedFormDialog
          open
          mode="create"
          species={species}
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <BreedFormDialog
          open
          mode="edit"
          breed={editing}
          species={species}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          loading={deletePending}
          error={deleteError ?? undefined}
          title="Hapus Ras Ternak?"
          description={`Apakah Anda yakin ingin menghapus ras "${deleting.name}"?`}
          confirmLabel="Hapus"
          onClose={() => {
            if (deletePending) return;
            setDeleting(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
