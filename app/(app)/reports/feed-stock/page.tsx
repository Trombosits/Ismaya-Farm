"use client";

import { useState } from "react";

import {
  HorizontalBarChart,
  StackedBarChart,
} from "@/components/reports/charts";
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
  getFeedTypeName,
  getFeedTypeUnit,
  getTransactionReference,
  inventoryTransactions,
  REFERENCE_TYPE_LABEL,
  TRANSACTION_TYPE_LABEL,
  type InventoryTransactionType,
} from "@/lib/feed";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  countBy,
  DEFAULT_PERIOD,
  monthKeysBetween,
  monthLabel,
  resolvePeriod,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function FeedStockReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [feedFilter, setFeedFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refFilter, setRefFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const domainFiltered = inventoryTransactions.filter((transaction) => {
    const matchesFeed =
      feedFilter === "all" || transaction.feed_type_id === feedFilter;
    const matchesType =
      typeFilter === "all" || transaction.transaction_type === typeFilter;
    const matchesRef =
      refFilter === "all" || transaction.reference_type === refFilter;
    return matchesFeed && matchesType && matchesRef;
  });

  const records = domainFiltered.filter((transaction) =>
    withinRange(transaction.transaction_date, range),
  );

  const feedTypeCount = new Set(
    records.map((transaction) => transaction.feed_type_id),
  ).size;
  const inCount = records.filter(
    (transaction) => transaction.transaction_type === "in",
  ).length;
  const outCount = records.length - inCount;

  const months = monthKeysBetween(range.from, range.to);
  const stacked = months.map((key) => {
    const monthRecords = records.filter(
      (transaction) => transaction.transaction_date.slice(0, 7) === key,
    );
    return {
      label: monthLabel(key),
      segments: [
        {
          label: "Masuk",
          value: monthRecords.filter(
            (transaction) => transaction.transaction_type === "in",
          ).length,
          tone: "success" as const,
        },
        {
          label: "Keluar",
          value: monthRecords.filter(
            (transaction) => transaction.transaction_type === "out",
          ).length,
          tone: "warning" as const,
        },
      ],
    };
  });

  const moveChart = countBy(records, (transaction) =>
    getFeedTypeName(transaction.feed_type_id),
  ).map((entry) => ({ label: entry.key, value: entry.count }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Pergerakan Stok Pakan"
        description="Arus stok pakan masuk dan keluar untuk pemantauan persediaan."
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
          <div className="sm:w-36">
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
          <div className="sm:w-44">
            <Select
              aria-label="Filter reference type"
              value={refFilter}
              onChange={(event) => setRefFilter(event.target.value)}
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
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard label="Total Jenis Pakan" value={feedTypeCount} />
        <SummaryCard label="Transaksi Masuk" value={inCount} accent="success" />
        <SummaryCard
          label="Transaksi Keluar"
          value={outCount}
          accent="warning"
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={records.length === 0}
        emptyTitle="Belum ada pergerakan stok"
        emptyDescription="Belum ada transaksi stok pada filter/periode yang dipilih."
      >
        <ReportSection
          title="Tren Pergerakan Stok"
          description="Jumlah transaksi masuk dan keluar per bulan."
        >
          <StackedBarChart data={stacked} />
        </ReportSection>

        <ReportSection title="Pergerakan Berdasarkan Jenis Pakan">
          <HorizontalBarChart data={moveChart} tone="info" />
        </ReportSection>

        <ReportSection title="Daftar Transaksi">
          <Table className="min-w-[960px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Jenis Pakan</TH>
                <TH>Tipe Transaksi</TH>
                <TH className="text-right">Quantity</TH>
                <TH>Unit Price</TH>
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
                    {formatNumber(transaction.quantity)}{" "}
                    {getFeedTypeUnit(transaction.feed_type_id)}
                  </TD>
                  <TD className="text-muted">
                    {transaction.unit_price > 0
                      ? formatCurrency(transaction.unit_price)
                      : "—"}
                  </TD>
                  <TD className="text-xs text-muted">
                    {getTransactionReference(transaction)}
                  </TD>
                  <TD className="max-w-44 truncate text-xs text-muted">
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
