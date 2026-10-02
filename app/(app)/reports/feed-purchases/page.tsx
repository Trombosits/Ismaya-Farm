"use client";

import { useState } from "react";

import { BarChart, LineChart } from "@/components/reports/charts";
import {
  ReportFilters,
  ReportHeader,
  ReportPeriodFilter,
  ReportSection,
  ReportStatePanel,
} from "@/components/reports/report-ui";
import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  feedPurchaseItems,
  feedPurchases,
  feedTypes,
  getFeedTypeName,
  getFeedTypeUnit,
  getPurchaseItems,
  getPurchaseTotal,
  getSupplierName,
} from "@/lib/feed";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  aggregateByMonth,
  DEFAULT_PERIOD,
  latestIso,
  resolvePeriod,
  sumBy,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function FeedPurchasesReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [feedFilter, setFeedFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const periodPurchases = feedPurchases.filter((purchase) =>
    withinRange(purchase.purchase_date, range),
  );

  const purchases =
    feedFilter === "all"
      ? periodPurchases
      : periodPurchases.filter((purchase) =>
          getPurchaseItems(purchase.id).some(
            (item) => item.feed_type_id === feedFilter,
          ),
        );

  const purchaseIds = new Set(purchases.map((purchase) => purchase.id));
  const items = feedPurchaseItems
    .filter((item) => purchaseIds.has(item.purchase_id))
    .filter(
      (item) => feedFilter === "all" || item.feed_type_id === feedFilter,
    );

  const totalSpending = purchases.reduce(
    (sum, purchase) => sum + getPurchaseTotal(purchase.id),
    0,
  );
  const latestPurchase = latestIso(
    purchases,
    (purchase) => purchase.purchase_date,
  );

  const trend = aggregateByMonth(
    purchases,
    (purchase) => purchase.purchase_date,
    range,
    (purchase) => getPurchaseTotal(purchase.id),
  );
  const byFeed = sumBy(
    items,
    (item) => getFeedTypeName(item.feed_type_id),
    (item) => item.subtotal,
  ).map((entry) => ({ label: entry.key, value: entry.total }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Pembelian Pakan"
        description="Tren pengeluaran dan pembelian pakan per jenis pakan."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="w-full sm:w-48">
          <Select
            aria-label="Filter jenis pakan"
            value={feedFilter}
            onChange={(event) => setFeedFilter(event.target.value)}
          >
            <option value="all">Semua Jenis Pakan</option>
            {feedTypes.map((feed) => (
              <option key={feed.id} value={feed.id}>
                {feed.name}
              </option>
            ))}
          </Select>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard label="Total Pembelian" value={purchases.length} />
        <SummaryCard
          label="Total Pengeluaran"
          value={formatCurrency(totalSpending)}
        />
        <SummaryCard
          label="Pembelian Terakhir"
          value={latestPurchase ? formatDate(latestPurchase) : "—"}
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={items.length === 0}
        emptyTitle="Belum ada pembelian pakan"
        emptyDescription="Belum ada pembelian pakan pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Pengeluaran Pakan">
            <LineChart
              data={trend}
              tone="brand"
              valueFormat={formatCurrency}
            />
          </ReportSection>
          <ReportSection title="Pembelian per Jenis Pakan">
            <BarChart
              data={byFeed}
              tone="success"
              valueFormat={formatCurrency}
            />
          </ReportSection>
        </div>

        <ReportSection title="Rincian Item Pembelian">
          <Table className="min-w-[960px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Invoice</TH>
                <TH>Supplier</TH>
                <TH>Jenis Pakan</TH>
                <TH className="text-right">Quantity</TH>
                <TH>Satuan</TH>
                <TH className="text-right">Unit Price</TH>
                <TH className="text-right">Subtotal</TH>
              </tr>
            </THead>
            <TBody>
              {items.map((item) => {
                const purchase = purchases.find(
                  (entry) => entry.id === item.purchase_id,
                );
                return (
                  <TR key={item.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {purchase ? formatDate(purchase.purchase_date) : "—"}
                    </TD>
                    <TD className="font-mono text-xs text-muted">
                      {purchase?.invoice_number ?? "—"}
                    </TD>
                    <TD>{purchase ? getSupplierName(purchase.supplier_id) : "—"}</TD>
                    <TD className="font-medium">
                      {getFeedTypeName(item.feed_type_id)}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(item.quantity)}
                    </TD>
                    <TD className="text-muted">
                      {getFeedTypeUnit(item.feed_type_id)}
                    </TD>
                    <TD className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TD>
                    <TD className="text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
