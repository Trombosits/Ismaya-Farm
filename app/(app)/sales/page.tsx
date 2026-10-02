"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { SaleFormDialog } from "@/components/sales/sale-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import { getSaleTotal, sales, type Sale } from "@/lib/products";

const PAGE_SIZE = 10;

export default function SalesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);

  const normalized = query.trim().toLowerCase();
  const isFiltered =
    normalized.length > 0 || dateFrom !== "" || dateTo !== "";

  const filtered = sales.filter((sale) => {
    const matchesQuery =
      normalized.length === 0 ||
      sale.invoice_number.toLowerCase().includes(normalized) ||
      sale.customer_name.toLowerCase().includes(normalized);
    const matchesFrom = dateFrom === "" || sale.sale_date >= dateFrom;
    const matchesTo = dateTo === "" || sale.sale_date <= dateTo;
    return matchesQuery && matchesFrom && matchesTo;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  const revenue = filtered.reduce(
    (sum, sale) => sum + getSaleTotal(sale.id),
    0,
  );
  const latestSaleDate = filtered.reduce<string | null>(
    (max, sale) =>
      max === null || sale.sale_date > max ? sale.sale_date : max,
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Penjualan"
        description="Catatan transaksi penjualan produk beserta customer dan totalnya."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Penjualan
          </Button>
        }
      />

      <SummaryCards>
        <SummaryCard label="Total Penjualan" value={filtered.length} />
        <SummaryCard label="Pendapatan" value={formatCurrency(revenue)} />
        <SummaryCard
          label="Penjualan Terbaru"
          value={latestSaleDate ? formatDate(latestSaleDate) : "—"}
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
            placeholder="Cari invoice atau customer…"
            aria-label="Cari penjualan berdasarkan invoice atau customer"
            className="w-full sm:max-w-xs"
          />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="Tanggal mulai"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="sm:w-40"
            />
            <span aria-hidden className="text-subtle">
              –
            </span>
            <Input
              type="date"
              aria-label="Tanggal akhir"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="sm:w-40"
            />
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
        emptyTitle="Belum ada data penjualan"
        emptyDescription="Belum ada transaksi penjualan yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Penjualan
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
              <TH>No. Invoice</TH>
              <TH>Tanggal</TH>
              <TH>Customer</TH>
              <TH className="text-right">Total</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((sale) => (
              <TR key={sale.id}>
                <TD>
                  <button
                    type="button"
                    onClick={() => router.push(`/sales/${sale.id}`)}
                    className="font-mono text-[13px] font-semibold text-ink transition-colors hover:text-brand-700"
                  >
                    {sale.invoice_number}
                  </button>
                </TD>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(sale.sale_date)}
                </TD>
                <TD className="font-medium">{sale.customer_name}</TD>
                <TD className="text-right font-medium">
                  {formatCurrency(getSaleTotal(sale.id))}
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${sale.invoice_number}`}
                    onView={() => router.push(`/sales/${sale.id}`)}
                    onEdit={() => setEditing(sale)}
                    onDelete={() => setDeleting(sale)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <SaleFormDialog open mode="create" onClose={() => setAddOpen(false)} />
      ) : null}

      {editing ? (
        <SaleFormDialog
          open
          mode="edit"
          sale={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Penjualan?"
          description={`Apakah Anda yakin ingin menghapus penjualan "${deleting.invoice_number}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
