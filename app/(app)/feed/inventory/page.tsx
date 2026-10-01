"use client";

import { useState } from "react";

import { InventoryHistoryDialog } from "@/components/feed/inventory-history-dialog";
import { InventoryTransactionFormDialog } from "@/components/feed/inventory-transaction-form-dialog";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import {
  feedTypes,
  getStockByFeedType,
  getStockStatus,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABEL,
  type FeedType,
  type StockStatus,
} from "@/lib/feed";
import { formatNumber } from "@/lib/format";

const PAGE_SIZE = 10;

export default function FeedInventoryPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [viewing, setViewing] = useState<FeedType | null>(null);
  const [transacting, setTransacting] = useState<FeedType | null>(null);

  const normalized = query.trim().toLowerCase();
  const isFiltered = normalized.length > 0 || statusFilter !== "all";

  const filtered = feedTypes.filter((feed) => {
    const stock = getStockByFeedType(feed.id);
    const status = getStockStatus(stock, feed.minimum_stock);
    const matchesQuery =
      normalized.length === 0 ||
      feed.name.toLowerCase().includes(normalized);
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Stok Pakan"
        description="Pemantauan stok pakan terkini beserta riwayat transaksinya."
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
            aria-label="Cari stok pakan berdasarkan nama"
            className="w-full sm:max-w-xs"
          />
          <div className="w-full sm:w-52">
            <Select
              aria-label="Filter status stok"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
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
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={6}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada data stok"
        emptyDescription="Belum ada jenis pakan dengan data stok."
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
        <Table className="min-w-[640px]">
          <THead>
            <tr>
              <TH>Jenis Pakan</TH>
              <TH>Satuan</TH>
              <TH className="text-right">Stok</TH>
              <TH className="text-right">Minimum Stok</TH>
              <TH>Status Stok</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((feed) => {
              const stock = getStockByFeedType(feed.id);
              const status = getStockStatus(stock, feed.minimum_stock);
              return (
                <TR key={feed.id}>
                  <TD className="font-medium">{feed.name}</TD>
                  <TD className="text-muted">{feed.unit}</TD>
                  <TD className="text-right font-medium">
                    {formatNumber(stock)}
                  </TD>
                  <TD className="text-right text-muted">
                    {formatNumber(feed.minimum_stock)}
                  </TD>
                  <TD>
                    <Badge variant={STOCK_STATUS_BADGE[status]}>
                      {STOCK_STATUS_LABEL[status]}
                    </Badge>
                  </TD>
                  <TD>
                    <RowActions
                      label={`Aksi untuk ${feed.name}`}
                      viewLabel="Riwayat Transaksi"
                      editLabel="Catat Transaksi"
                      onView={() => setViewing(feed)}
                      onEdit={() => setTransacting(feed)}
                    />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableStatePanel>

      {viewing ? (
        <InventoryHistoryDialog
          feedType={viewing}
          onClose={() => setViewing(null)}
        />
      ) : null}

      {transacting ? (
        <InventoryTransactionFormDialog
          defaultFeedTypeId={transacting.id}
          onClose={() => setTransacting(null)}
        />
      ) : null}
    </div>
  );
}
