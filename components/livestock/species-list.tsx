"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, SearchX } from "lucide-react";

import { SpeciesFormDialog } from "@/components/livestock/species-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { deleteSpecies } from "@/lib/actions/species";
import { formatDate } from "@/lib/livestock";
import type { SpeciesRow } from "@/lib/supabase/types";

const PAGE_SIZE = 10;

export function SpeciesList({ species }: { species: SpeciesRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SpeciesRow | null>(null);
  const [deleting, setDeleting] = useState<SpeciesRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const normalized = query.trim().toLowerCase();
  const filtered = species.filter(
    (entry) =>
      entry.name.toLowerCase().includes(normalized) ||
      entry.code.toLowerCase().includes(normalized),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const isSearchEmpty = normalized.length > 0 && filtered.length === 0;
  const hasNoData = species.length === 0;

  function handleDelete() {
    if (!deleting) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteSpecies(deleting.id);
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
        title="Jenis Ternak"
        description="Master data jenis ternak sebagai acuan klasifikasi ras dan data ternak."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Jenis Ternak
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
            placeholder="Cari jenis ternak…"
            aria-label="Cari jenis ternak berdasarkan nama atau kode"
            className="sm:max-w-xs"
          />
        </TableToolbarGroup>
      </TableToolbar>

      {hasNoData ? (
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
            {rows.map((entry) => (
              <TR key={entry.id}>
                <TD className="font-mono text-xs text-muted">{entry.code}</TD>
                <TD className="font-medium">{entry.name}</TD>
                <TD className="hidden text-xs text-muted md:table-cell">
                  {formatDate(entry.created_at)}
                </TD>
                <TD className="hidden text-xs text-muted lg:table-cell">
                  {formatDate(entry.updated_at)}
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${entry.name}`}
                    onEdit={() => setEditing(entry)}
                    onDelete={() => {
                      setDeleteError(null);
                      setDeleting(entry);
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
          loading={deletePending}
          error={deleteError ?? undefined}
          title="Hapus Jenis Ternak?"
          description={`Apakah Anda yakin ingin menghapus jenis ternak "${deleting.name}"?`}
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
