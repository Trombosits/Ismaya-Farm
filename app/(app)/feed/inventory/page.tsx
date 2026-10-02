"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { InventoryTransactionFormDialog } from "@/components/feed/inventory-transaction-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { Tabs } from "@/components/ui/tabs";
import {
  feedTypes,
  getFeedTypeName,
  getFeedTypeUnit,
  getStockByFeedType,
  getStockStatus,
  getTransactionReference,
  inventoryTransactions,
  REFERENCE_TYPE_LABEL,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABEL,
  TRANSACTION_TYPE_LABEL,
  type FeedInventoryTransaction,
  type InventoryTransactionType,
  type StockStatus,
} from "@/lib/feed";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";

const PAGE_SIZE = 10;

type InventoryView = "stock" | "transactions";

const VIEW_TABS = [
  { value: "stock", label: "Stok Saat Ini" },
  { value: "transactions", label: "Transaksi Stok" },
];

export default function FeedInventoryPage() {
  const [view, setView] = useState<InventoryView>("stock");

  // Stock view state
  const [stockQuery, setStockQuery] = useState("");
  const [feedFilter, setFeedFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [stockPage, setStockPage] = useState(1);
  const [stockViewState, setStockViewState] = useState<TableViewState>("data");

  // Transaction view state
  const [txQuery, setTxQuery] = useState("");
  const [txFeedFilter, setTxFeedFilter] = useState("all");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txRefFilter, setTxRefFilter] = useState("all");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [txViewState, setTxViewState] = useState<TableViewState>("data");

  // Dialogs
  const [transactOpen, setTransactOpen] = useState(false);
  const [editingTx, setEditingTx] =
    useState<FeedInventoryTransaction | null>(null);
  const [deletingTx, setDeletingTx] =
    useState<FeedInventoryTransaction | null>(null);

  const stockRows = feedTypes.map((feed) => {
    const stock = getStockByFeedType(feed.id);
    return { feed, stock, status: getStockStatus(stock, feed.minimum_stock) };
  });

  const normalizedStock = stockQuery.trim().toLowerCase();
  const stockFiltered = stockRows.filter((row) => {
    const matchesQuery =
      normalizedStock.length === 0 ||
      row.feed.name.toLowerCase().includes(normalizedStock);
    const matchesFeed = feedFilter === "all" || row.feed.id === feedFilter;
    const matchesStatus =
      stockStatusFilter === "all" || row.status === stockStatusFilter;
    return matchesQuery && matchesFeed && matchesStatus;
  });

  const belowCount = stockFiltered.filter(
    (row) => row.status === "below",
  ).length;
  const nearCount = stockFiltered.filter((row) => row.status === "near").length;

  const stockPageCount = Math.max(
    1,
    Math.ceil(stockFiltered.length / PAGE_SIZE),
  );
  const safeStockPage = Math.min(stockPage, stockPageCount);
  const stockPageRows = stockFiltered.slice(
    (safeStockPage - 1) * PAGE_SIZE,
    safeStockPage * PAGE_SIZE,
  );
  const stockSearchEmpty =
    (normalizedStock.length > 0 ||
      feedFilter !== "all" ||
      stockStatusFilter !== "all") &&
    stockFiltered.length === 0;

  const normalizedTx = txQuery.trim().toLowerCase();
  const txFiltered = inventoryTransactions
    .filter((transaction) => {
      const feedName = getFeedTypeName(transaction.feed_type_id);
      const reference = getTransactionReference(transaction);
      const matchesQuery =
        normalizedTx.length === 0 ||
        feedName.toLowerCase().includes(normalizedTx) ||
        reference.toLowerCase().includes(normalizedTx) ||
        transaction.notes.toLowerCase().includes(normalizedTx);
      const matchesFeed =
        txFeedFilter === "all" || transaction.feed_type_id === txFeedFilter;
      const matchesType =
        txTypeFilter === "all" ||
        transaction.transaction_type === txTypeFilter;
      const matchesRef =
        txRefFilter === "all" || transaction.reference_type === txRefFilter;
      const matchesFrom =
        txDateFrom === "" || transaction.transaction_date >= txDateFrom;
      const matchesTo =
        txDateTo === "" || transaction.transaction_date <= txDateTo;
      return (
        matchesQuery &&
        matchesFeed &&
        matchesType &&
        matchesRef &&
        matchesFrom &&
        matchesTo
      );
    })
    .sort((a, b) =>
      a.transaction_date < b.transaction_date
        ? 1
        : a.transaction_date > b.transaction_date
          ? -1
          : 0,
    );

  const txPageCount = Math.max(1, Math.ceil(txFiltered.length / PAGE_SIZE));
  const safeTxPage = Math.min(txPage, txPageCount);
  const txPageRows = txFiltered.slice(
    (safeTxPage - 1) * PAGE_SIZE,
    safeTxPage * PAGE_SIZE,
  );
  const txSearchEmpty =
    (normalizedTx.length > 0 ||
      txFeedFilter !== "all" ||
      txTypeFilter !== "all" ||
      txRefFilter !== "all" ||
      txDateFrom !== "" ||
      txDateTo !== "") &&
    txFiltered.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Stok Pakan"
        description="Pemantauan stok pakan saat ini beserta riwayat transaksinya."
        actions={
          <Button
            onClick={() => setTransactOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden className="size-4" />
            Catat Transaksi
          </Button>
        }
      />

      <Tabs
        tabs={VIEW_TABS}
        value={view}
        onValueChange={(value) => setView(value as InventoryView)}
        aria-label="Tampilan stok pakan"
      />

      {view === "stock" ? (
        <div className="flex flex-col gap-5">
          <SummaryCards>
            <SummaryCard label="Jenis Pakan" value={stockFiltered.length} />
            <SummaryCard
              label="Di Bawah Minimum"
              value={belowCount}
              hint="Stok di bawah batas minimum"
              accent="danger"
            />
            <SummaryCard
              label="Mendekati Minimum"
              value={nearCount}
              hint="Stok mendekati batas minimum"
              accent="warning"
            />
          </SummaryCards>

          <DataSectionHeading title="Daftar Stok Pakan" />

          <TableToolbar>
            <TableToolbarGroup className="sm:flex-1">
              <SearchInput
                value={stockQuery}
                onValueChange={(value) => {
                  setStockQuery(value);
                  setStockPage(1);
                }}
                placeholder="Cari jenis pakan…"
                aria-label="Cari stok pakan berdasarkan nama"
                className="w-full sm:max-w-xs"
              />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <div className="sm:w-48">
                  <Select
                    aria-label="Filter jenis pakan"
                    value={feedFilter}
                    onChange={(event) => {
                      setFeedFilter(event.target.value);
                      setStockPage(1);
                    }}
                  >
                    <option value="all">Semua Jenis Pakan</option>
                    {feedTypes.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:w-52">
                  <Select
                    aria-label="Filter status stok"
                    value={stockStatusFilter}
                    onChange={(event) => {
                      setStockStatusFilter(event.target.value);
                      setStockPage(1);
                    }}
                  >
                    <option value="all">Semua Status Stok</option>
                    {(Object.keys(STOCK_STATUS_LABEL) as StockStatus[]).map(
                      (status) => (
                        <option key={status} value={status}>
                          {STOCK_STATUS_LABEL[status]}
                        </option>
                      ),
                    )}
                  </Select>
                </div>
              </div>
            </TableToolbarGroup>
            <TableToolbarGroup>
              <TableStatePreview
                value={stockViewState}
                onChange={setStockViewState}
              />
            </TableToolbarGroup>
          </TableToolbar>

          <TableStatePanel
            state={stockViewState}
            onRetry={() => setStockViewState("data")}
            columns={5}
            searchEmpty={stockSearchEmpty}
            emptyTitle="Belum ada data stok"
            emptyDescription="Belum ada jenis pakan dengan data stok."
            pagination={
              <Pagination
                page={safeStockPage}
                pageCount={stockPageCount}
                total={stockFiltered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setStockPage}
              />
            }
          >
            <Table className="min-w-[560px]">
              <THead>
                <tr>
                  <TH>Jenis Pakan</TH>
                  <TH>Satuan</TH>
                  <TH className="text-right">Stok</TH>
                  <TH className="text-right">Minimum Stok</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {stockPageRows.map((row) => (
                  <TR key={row.feed.id}>
                    <TD className="font-medium">{row.feed.name}</TD>
                    <TD className="text-muted">{row.feed.unit}</TD>
                    <TD className="text-right font-medium">
                      {formatNumber(row.stock)}
                    </TD>
                    <TD className="text-right text-muted">
                      {formatNumber(row.feed.minimum_stock)}
                    </TD>
                    <TD>
                      <Badge variant={STOCK_STATUS_BADGE[row.status]}>
                        {STOCK_STATUS_LABEL[row.status]}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableStatePanel>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <TableToolbar>
            <TableToolbarGroup className="sm:flex-1">
              <SearchInput
                value={txQuery}
                onValueChange={(value) => {
                  setTxQuery(value);
                  setTxPage(1);
                }}
                placeholder="Cari pakan, reference, atau catatan…"
                aria-label="Cari transaksi berdasarkan pakan, reference, atau catatan"
                className="w-full sm:max-w-xs"
              />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <div className="sm:w-44">
                  <Select
                    aria-label="Filter jenis pakan"
                    value={txFeedFilter}
                    onChange={(event) => {
                      setTxFeedFilter(event.target.value);
                      setTxPage(1);
                    }}
                  >
                    <option value="all">Semua Pakan</option>
                    {feedTypes.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:w-36">
                  <Select
                    aria-label="Filter tipe transaksi"
                    value={txTypeFilter}
                    onChange={(event) => {
                      setTxTypeFilter(event.target.value);
                      setTxPage(1);
                    }}
                  >
                    <option value="all">Semua Tipe</option>
                    {(
                      Object.keys(
                        TRANSACTION_TYPE_LABEL,
                      ) as InventoryTransactionType[]
                    ).map((type) => (
                      <option key={type} value={type}>
                        {TRANSACTION_TYPE_LABEL[type]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:w-44">
                  <Select
                    aria-label="Filter reference type"
                    value={txRefFilter}
                    onChange={(event) => {
                      setTxRefFilter(event.target.value);
                      setTxPage(1);
                    }}
                  >
                    <option value="all">Semua Reference</option>
                    {(
                      Object.keys(REFERENCE_TYPE_LABEL) as Array<
                        keyof typeof REFERENCE_TYPE_LABEL
                      >
                    ).map((type) => (
                      <option key={type} value={type}>
                        {REFERENCE_TYPE_LABEL[type]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <Input
                    type="date"
                    aria-label="Tanggal mulai"
                    value={txDateFrom}
                    onChange={(event) => {
                      setTxDateFrom(event.target.value);
                      setTxPage(1);
                    }}
                    className="sm:w-36"
                  />
                  <span aria-hidden className="text-subtle">
                    –
                  </span>
                  <Input
                    type="date"
                    aria-label="Tanggal akhir"
                    value={txDateTo}
                    onChange={(event) => {
                      setTxDateTo(event.target.value);
                      setTxPage(1);
                    }}
                    className="sm:w-36"
                  />
                </div>
              </div>
            </TableToolbarGroup>
            <TableToolbarGroup>
              <TableStatePreview
                value={txViewState}
                onChange={setTxViewState}
              />
            </TableToolbarGroup>
          </TableToolbar>

          <TableStatePanel
            state={txViewState}
            onRetry={() => setTxViewState("data")}
            columns={8}
            searchEmpty={txSearchEmpty}
            emptyTitle="Belum ada transaksi stok"
            emptyDescription="Belum ada transaksi pergerakan stok pakan."
            pagination={
              <Pagination
                page={safeTxPage}
                pageCount={txPageCount}
                total={txFiltered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setTxPage}
              />
            }
          >
            <Table className="min-w-[980px]">
              <THead>
                <tr>
                  <TH>Tanggal</TH>
                  <TH>Pakan</TH>
                  <TH>Tipe Transaksi</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH className="text-right">Unit Price</TH>
                  <TH>Reference</TH>
                  <TH>Notes</TH>
                  <TH className="w-40 text-right">Aksi</TH>
                </tr>
              </THead>
              <TBody>
                {txPageRows.map((transaction) => (
                  <TR key={transaction.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDate(transaction.transaction_date)}
                    </TD>
                    <TD className="font-medium">
                      {getFeedTypeName(transaction.feed_type_id)}
                    </TD>
                    <TD>
                      <Badge
                        variant={
                          transaction.transaction_type === "in"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {TRANSACTION_TYPE_LABEL[transaction.transaction_type]}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      {formatNumber(transaction.quantity)}{" "}
                      {getFeedTypeUnit(transaction.feed_type_id)}
                    </TD>
                    <TD className="text-right text-muted">
                      {transaction.unit_price > 0
                        ? formatCurrency(transaction.unit_price)
                        : "—"}
                    </TD>
                    <TD className="text-xs text-muted">
                      {getTransactionReference(transaction)}
                    </TD>
                    <TD className="max-w-48 truncate text-xs text-muted">
                      {transaction.notes || "—"}
                    </TD>
                    <TD>
                      <RowActions
                        label="Aksi transaksi stok"
                        onEdit={() => setEditingTx(transaction)}
                        onDelete={() => setDeletingTx(transaction)}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableStatePanel>
        </div>
      )}

      {transactOpen ? (
        <InventoryTransactionFormDialog
          open
          mode="create"
          onClose={() => setTransactOpen(false)}
        />
      ) : null}

      {editingTx ? (
        <InventoryTransactionFormDialog
          open
          mode="edit"
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      ) : null}

      {deletingTx ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Transaksi Stok?"
          description="Apakah Anda yakin ingin menghapus transaksi stok ini?"
          confirmLabel="Hapus"
          onClose={() => setDeletingTx(null)}
          onConfirm={() => setDeletingTx(null)}
        />
      ) : null}
    </div>
  );
}
