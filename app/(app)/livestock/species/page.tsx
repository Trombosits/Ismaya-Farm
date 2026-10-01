"use client";

import { useState } from "react";
import { Plus, SearchX } from "lucide-react";

import { SpeciesFormDialog } from "@/components/livestock/species-form-dialog";
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
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { formatDate, speciesList, type LivestockSpecies } from "@/lib/livestock";

const PAGE_SIZE = 10;

export default function SpeciesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<LivestockSpecies | null>(null);
  const [deleting, setDeleting] = useState<LivestockSpecies | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = speciesList.filter(
    (species) =>
      species.name.toLowerCase().includes(normalized) ||
      species.code.toLowerCase().includes(normalized),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const isSearchEmpty = normalized.length > 0 && filtered.length === 0;

  function handleQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Jenis Ternak"
        description="Master data jenis ternak sebagai acuan klasifikasi ras dan data ternak."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            Tambah Jenis Ternak
          </Button>
        }
      />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={handleQuery}
            placeholder="Cari jenis ternak…"
            aria-label="Cari jenis ternak berdasarkan nama atau kode"
            className="sm:max-w-xs"
          />
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      {viewState === "loading" ? (
        <TableSkeleton rows={8} columns={5} />
      ) : viewState === "error" ? (
        <ErrorState onRetry={() => setViewState("data")} />
      ) : viewState === "empty" ? (
        <EmptyState
          title="Belum ada jenis ternak"
          description="Belum ada data jenis ternak yang tersedia."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden className="size-4" />
              Tambah Jenis Ternak
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
              <TH className="hidden md:table-cell">Dibuat</TH>
              <TH className="hidden lg:table-cell">Diperbarui</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((species) => (
              <TR key={species.id}>
                <TD className="font-mono text-xs text-muted">{species.code}</TD>
                <TD className="font-medium">{species.name}</TD>
                <TD className="hidden text-xs text-muted md:table-cell">
                  {formatDate(species.created_at)}
                </TD>
                <TD className="hidden text-xs text-muted lg:table-cell">
                  {formatDate(species.updated_at)}
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${species.name}`}
                    onEdit={() => setEditing(species)}
                    onDelete={() => setDeleting(species)}
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
        <SpeciesFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <SpeciesFormDialog
          open
          mode="edit"
          species={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Jenis Ternak?"
          description={`Apakah Anda yakin ingin menghapus jenis ternak "${deleting.name}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
