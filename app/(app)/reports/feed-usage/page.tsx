"use client";

import { useState } from "react";

import { HorizontalBarChart, LineChart } from "@/components/reports/charts";
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
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  feedTypes,
  getFeedType,
  getFeedTypeName,
  getFeedTypeUnit,
  getTransactionReference,
  inventoryTransactions,
  REFERENCE_TYPE_LABEL,
  TRANSACTION_TYPE_LABEL,
  type InventoryTransactionType,
} from "@/lib/feed";
import { formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  aggregateByMonth,
  countBy,
  DEFAULT_PERIOD,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function FeedUsageReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [feedFilter, setFeedFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);
  const selectedFeed = feedFilter === "all" ? null : getFeedType(feedFilter);

  const domainFiltered = inventoryTransactions.filter((transaction) => {
    const matchesFeed =
      feedFilter === "all" || transaction.feed_type_id === feedFilter;
    const matchesType =
      typeFilter === "all" || transaction.transaction_type === typeFilter;
    return matchesFeed && matchesType;
  });

  const records = domainFiltered.filter((transaction) =>
    withinRange(transaction.transaction_date, range),
  );

  const trend = aggregateByMonth(
    records,
    (transaction) => transaction.transaction_date,
    range,
    (transaction) => (selectedFeed ? transaction.quantity : 1),
  );

  const byFeed = countBy(records, (transaction) =>
    getFeedTypeName(transaction.feed_type_id),
  );
  const topFeed = byFeed[0]?.key ?? "—";
  const feedChart = byFeed.map((entry) => ({
    label: entry.key,
    value: entry.count,
  }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Penggunaan Pakan"
        description="Tren penggunaan stok pakan dan jenis pakan yang paling banyak digunakan."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <div className="sm:w-48">
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
          <div className="sm:w-40">
            <Select
              aria-label="Filter tipe transaksi"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">Semua Tipe</option>
              {(
                Object.keys(TRANSACTION_TYPE_LABEL) as InventoryTransactionType[]
              ).map((type) => (
                <option key={type} value={type}>
                  {TRANSACTION_TYPE_LABEL[type]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard
          label="Total Penggunaan"
          value={domainFiltered.length}
          hint="Jumlah transaksi penggunaan"
        />
        <SummaryCard
          label="Pakan Terbanyak"
          value={topFeed}
          hint="Berdasarkan jumlah transaksi penggunaan"
        />
        <SummaryCard
          label="Periode Ini"
          value={records.length}
          accent="info"
          hint="Transaksi pada periode terpilih"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={records.length === 0}
        emptyTitle="Belum ada penggunaan pakan"
        emptyDescription="Belum ada transaksi penggunaan pada filter/periode yang dipilih."
      >
        <ReportSection
          title="Tren Penggunaan Pakan"
          description={
            selectedFeed
              ? `Quantity per bulan (${selectedFeed.unit}).`
              : "Jumlah transaksi per bulan (satuan antar pakan dapat berbeda)."
          }
        >
          <LineChart data={trend} tone="brand" />
        </ReportSection>

        <ReportSection title="Penggunaan Berdasarkan Jenis Pakan">
          <HorizontalBarChart data={feedChart} tone="brand" />
        </ReportSection>

        <ReportSection title="Daftar Transaksi">
          <Table className="min-w-[900px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Jenis Pakan</TH>
                <TH>Tipe Transaksi</TH>
                <TH className="text-right">Quantity</TH>
                <TH>Satuan</TH>
                <TH>Reference</TH>
                <TH>Catatan</TH>
              </tr>
            </THead>
            <TBody>
              {records.map((transaction) => (
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
                    {formatNumber(transaction.quantity)}
                  </TD>
                  <TD className="text-muted">
                    {getFeedTypeUnit(transaction.feed_type_id)}
                  </TD>
                  <TD className="text-xs text-muted">
                    {REFERENCE_TYPE_LABEL[transaction.reference_type]}
                    {transaction.reference_id
                      ? ` · ${getTransactionReference(transaction)}`
                      : ""}
                  </TD>
                  <TD className="max-w-48 truncate text-xs text-muted">
                    {transaction.notes || "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ReportSection>
      </ReportStatePanel>
    </div>
  );
}
