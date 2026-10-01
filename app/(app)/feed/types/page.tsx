"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { FeedTypeFormDialog } from "@/components/feed/feed-type-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { feedTypes, type FeedType } from "@/lib/feed";
import { formatNumber } from "@/lib/format";

const PAGE_SIZE = 10;

export default function FeedTypesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<FeedType | null>(null);
  const [deleting, setDeleting] = useState<FeedType | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = feedTypes.filter(
    (feed) =>
      normalized.length === 0 ||
      feed.name.toLowerCase().includes(normalized) ||
      feed.unit.toLowerCase().includes(normalized),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = normalized.length > 0 && filtered.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Jenis Pakan"
        description="Master data jenis pakan beserta satuan dan batas minimum stoknya."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Jenis Pakan
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
            placeholder="Cari jenis pakan…"
            aria-label="Cari jenis pakan berdasarkan nama atau satuan"
            className="w-full sm:max-w-xs"
          />
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={5}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada jenis pakan"
        emptyDescription="Belum ada data jenis pakan yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Jenis Pakan
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
        <Table className="min-w-[560px]">
          <THead>
            <tr>
              <TH>Nama Pakan</TH>
              <TH>Satuan</TH>
              <TH className="text-right">Minimum Stok</TH>
              <TH>Status</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((feed) => (
              <TR key={feed.id}>
                <TD className="font-medium">{feed.name}</TD>
                <TD className="text-muted">{feed.unit}</TD>
                <TD className="text-right">{formatNumber(feed.minimum_stock)}</TD>
                <TD>
                  <Badge variant={feed.is_active ? "success" : "neutral"}>
                    {feed.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${feed.name}`}
                    onEdit={() => setEditing(feed)}
                    onDelete={() => setDeleting(feed)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <FeedTypeFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <FeedTypeFormDialog
          open
          mode="edit"
          feedType={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Jenis Pakan?"
          description={`Apakah Anda yakin ingin menghapus jenis pakan "${deleting.name}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
