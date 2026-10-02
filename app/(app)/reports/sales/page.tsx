"use client";

import { useState } from "react";
import Link from "next/link";

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
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  getProductName,
  getSaleItems,
  getSaleTotal,
  products,
  saleItems,
  sales,
} from "@/lib/products";
import {
  aggregateByMonth,
  DEFAULT_PERIOD,
  latestIso,
  resolvePeriod,
  sumBy,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function SalesReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [productFilter, setProductFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);
  const normalized = query.trim().toLowerCase();

  const filtered = sales.filter((sale) => {
    const matchesPeriod = withinRange(sale.sale_date, range);
    const matchesQuery =
      normalized.length === 0 ||
      sale.invoice_number.toLowerCase().includes(normalized) ||
      sale.customer_name.toLowerCase().includes(normalized);
    const matchesProduct =
      productFilter === "all" ||
      saleItems.some(
        (item) =>
          item.sale_id === sale.id && item.product_id === productFilter,
      );
    return matchesPeriod && matchesQuery && matchesProduct;
  });

  const revenue = filtered.reduce(
    (sum, sale) => sum + getSaleTotal(sale.id),
    0,
  );
  const average = filtered.length > 0 ? Math.round(revenue / filtered.length) : 0;
  const latestSale = latestIso(filtered, (sale) => sale.sale_date);

  const trend = aggregateByMonth(
    filtered,
    (sale) => sale.sale_date,
    range,
    (sale) => getSaleTotal(sale.id),
  );

  const saleIds = new Set(filtered.map((sale) => sale.id));
  const byProduct = sumBy(
    saleItems
      .filter((item) => saleIds.has(item.sale_id))
      .filter(
        (item) => productFilter === "all" || item.product_id === productFilter,
      ),
    (item) => getProductName(item.product_id),
    (item) => item.subtotal,
  ).map((entry) => ({ label: entry.key, value: entry.total }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Penjualan"
        description="Tren nilai penjualan dan kontribusi per produk."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Cari invoice atau customer…"
          aria-label="Cari invoice atau customer"
          className="w-full sm:max-w-xs"
        />
        <div className="w-full sm:w-48">
          <Select
            aria-label="Filter produk"
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
          >
            <option value="all">Semua Produk</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards columns={4}>
        <SummaryCard label="Total Penjualan" value={filtered.length} />
        <SummaryCard
          label="Pendapatan"
          value={formatCurrency(revenue)}
          accent="success"
        />
        <SummaryCard
          label="Rata-rata Nilai"
          value={formatCurrency(average)}
        />
        <SummaryCard
          label="Penjualan Terbaru"
          value={latestSale ? formatDate(latestSale) : "—"}
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={filtered.length === 0}
        emptyTitle="Belum ada data penjualan"
        emptyDescription="Belum ada penjualan pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Penjualan" description="Nilai penjualan per bulan.">
            <LineChart data={trend} tone="success" valueFormat={formatCurrency} />
          </ReportSection>
          <ReportSection title="Penjualan Berdasarkan Produk">
            <BarChart data={byProduct} tone="brand" valueFormat={formatCurrency} />
          </ReportSection>
        </div>

        <ReportSection title="Daftar Penjualan">
          <Table className="min-w-[760px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Invoice</TH>
                <TH>Customer</TH>
                <TH className="text-right">Jumlah Item</TH>
                <TH className="text-right">Total</TH>
                <TH className="w-16 text-right">Aksi</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((sale) => (
                <TR key={sale.id}>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(sale.sale_date)}
                  </TD>
                  <TD className="font-mono text-xs text-muted">
                    {sale.invoice_number}
                  </TD>
                  <TD className="font-medium">{sale.customer_name}</TD>
                  <TD className="text-right">{getSaleItems(sale.id).length}</TD>
                  <TD className="text-right font-medium">
                    {formatCurrency(getSaleTotal(sale.id))}
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/sales/${sale.id}`}
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      Detail
                    </Link>
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
