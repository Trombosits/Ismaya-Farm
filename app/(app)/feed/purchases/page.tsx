"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { FeedPurchaseDetailDialog } from "@/components/feed/feed-purchase-detail-dialog";
import { FeedPurchaseFormDialog } from "@/components/feed/feed-purchase-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import {
  feedPurchases,
  getPurchaseItems,
  getPurchaseTotal,
  getSupplierName,
  suppliers,
  type FeedPurchase,
} from "@/lib/feed";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/livestock";

const PAGE_SIZE = 10;

export default function FeedPurchasesPage() {
  const [query, setQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<FeedPurchase | null>(null);
  const [deleting, setDeleting] = useState<FeedPurchase | null>(null);
  const [viewing, setViewing] = useState<FeedPurchase | null>(null);

  const normalized = query.trim().toLowerCase();
  const isFiltered = normalized.length > 0 || supplierFilter !== "all";
  const filtered = feedPurchases.filter((purchase) => {
    const supplierName = getSupplierName(purchase.supplier_id).toLowerCase();
    const matchesQuery =
      normalized.length === 0 ||
      purchase.invoice_number.toLowerCase().includes(normalized) ||
      supplierName.includes(normalized);
    const matchesSupplier =
      supplierFilter === "all" || purchase.supplier_id === supplierFilter;
    return matchesQuery && matchesSupplier;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  const totalSpending = filtered.reduce(
    (sum, purchase) => sum + getPurchaseTotal(purchase.id),
    0,
  );
  const latestPurchaseDate = filtered.reduce<string | null>(
    (max, purchase) =>
      max === null || purchase.purchase_date > max
        ? purchase.purchase_date
        : max,
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pembelian Pakan"
        description="Catatan pembelian pakan dari supplier beserta rincian itemnya."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Pembelian
          </Button>
        }
      />

      <SummaryCards>
        <SummaryCard label="Total Pembelian" value={filtered.length} />
        <SummaryCard
          label="Total Pengeluaran"
          value={formatCurrency(totalSpending)}
        />
        <SummaryCard
          label="Pembelian Terakhir"
          value={latestPurchaseDate ? formatDate(latestPurchaseDate) : "—"}
        />
      </SummaryCards>

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari invoice atau supplier…"
            aria-label="Cari pembelian berdasarkan invoice atau supplier"
            className="w-full sm:max-w-xs"
          />
          <div className="w-full sm:w-52">
            <Select
              aria-label="Filter supplier"
              value={supplierFilter}
              onChange={(event) => {
                setSupplierFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Semua Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
          </div>
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
        emptyTitle="Belum ada pembelian pakan"
        emptyDescription="Belum ada data pembelian pakan yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Pembelian
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
        <Table className="min-w-[680px]">
          <THead>
            <tr>
              <TH>Tanggal</TH>
              <TH>Supplier</TH>
              <TH>No. Invoice</TH>
              <TH className="text-right">Total Pembelian</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((purchase) => (
              <TR key={purchase.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(purchase.purchase_date)}
                </TD>
                <TD className="font-medium">
                  {getSupplierName(purchase.supplier_id)}
                </TD>
                <TD className="font-mono text-xs text-muted">
                  {purchase.invoice_number || "—"}
                </TD>
                <TD className="text-right font-medium">
                  {formatCurrency(getPurchaseTotal(purchase.id))}
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${purchase.invoice_number}`}
                    onView={() => setViewing(purchase)}
                    onEdit={() => setEditing(purchase)}
                    onDelete={() => setDeleting(purchase)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <FeedPurchaseFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <FeedPurchaseFormDialog
          open
          mode="edit"
          purchase={editing}
          initialItems={getPurchaseItems(editing.id)}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {viewing ? (
        <FeedPurchaseDetailDialog
          purchase={viewing}
          onClose={() => setViewing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Pembelian Pakan?"
          description={`Apakah Anda yakin ingin menghapus pembelian "${deleting.invoice_number}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
