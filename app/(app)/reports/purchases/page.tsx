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
import { Select } from "@/components/ui/select";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  getPurchaseCategoryName,
  getPurchaseItemsByPurchase,
  getPurchaseTotal,
  getSupplierName,
  purchaseCategories,
  purchases,
  suppliers,
} from "@/lib/purchases";
import {
  aggregateByMonth,
  DEFAULT_PERIOD,
  latestIso,
  resolvePeriod,
  sumBy,
  withinRange,
  type ReportPeriod,
} from "@/lib/reports";

export default function PurchasesReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>(DEFAULT_PERIOD);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [viewState, setViewState] = useState<TableViewState>("data");

  const range = resolvePeriod(period);

  const filtered = purchases.filter((purchase) => {
    const matchesPeriod = withinRange(purchase.purchase_date, range);
    const matchesCategory =
      categoryFilter === "all" || purchase.category_id === categoryFilter;
    const matchesSupplier =
      supplierFilter === "all" || purchase.supplier_id === supplierFilter;
    return matchesPeriod && matchesCategory && matchesSupplier;
  });

  const totalSpending = filtered.reduce(
    (sum, purchase) => sum + getPurchaseTotal(purchase.id),
    0,
  );
  const latestPurchase = latestIso(
    filtered,
    (purchase) => purchase.purchase_date,
  );

  const trend = aggregateByMonth(
    filtered,
    (purchase) => purchase.purchase_date,
    range,
    (purchase) => getPurchaseTotal(purchase.id),
  );

  const purchaseIds = new Set(filtered.map((purchase) => purchase.id));
  const byCategory = sumBy(
    purchases
      .filter((purchase) => purchaseIds.has(purchase.id))
      .flatMap((purchase) => getPurchaseItemsByPurchase(purchase.id)),
    (item) => {
      const parent = filtered.find(
        (purchase) => purchase.id === item.purchase_id,
      );
      return parent ? getPurchaseCategoryName(parent.category_id) : "—";
    },
    (item) => item.subtotal,
  ).map((entry) => ({ label: entry.key, value: entry.total }));

  return (
    <div className="flex flex-col gap-5">
      <ReportHeader
        title="Pembelian"
        description="Tren pengeluaran pembelian operasional dan pembelian per kategori."
      />

      <ReportFilters>
        <ReportPeriodFilter value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <div className="sm:w-48">
            <Select
              aria-label="Filter kategori"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {purchaseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-48">
            <Select
              aria-label="Filter supplier"
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
            >
              <option value="all">Semua Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <TableStatePreview value={viewState} onChange={setViewState} />
      </ReportFilters>

      <SummaryCards>
        <SummaryCard label="Total Pembelian" value={filtered.length} />
        <SummaryCard
          label="Total Pengeluaran"
          value={formatCurrency(totalSpending)}
        />
        <SummaryCard
          label="Pembelian Terbaru"
          value={latestPurchase ? formatDate(latestPurchase) : "—"}
        />
      </SummaryCards>

      <ReportStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        isEmpty={filtered.length === 0}
        emptyTitle="Belum ada data pembelian"
        emptyDescription="Belum ada pembelian pada filter/periode yang dipilih."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection title="Tren Pengeluaran Pembelian">
            <LineChart data={trend} tone="brand" valueFormat={formatCurrency} />
          </ReportSection>
          <ReportSection title="Pembelian Berdasarkan Kategori">
            <BarChart
              data={byCategory}
              tone="info"
              valueFormat={formatCurrency}
            />
          </ReportSection>
        </div>

        <ReportSection title="Daftar Pembelian">
          <Table className="min-w-[820px]">
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Supplier</TH>
                <TH>Kategori</TH>
                <TH className="text-right">Total</TH>
                <TH>Catatan</TH>
                <TH className="w-16 text-right">Aksi</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((purchase) => (
                <TR key={purchase.id}>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(purchase.purchase_date)}
                  </TD>
                  <TD className="font-medium">
                    {getSupplierName(purchase.supplier_id)}
                  </TD>
                  <TD className="text-muted">
                    {getPurchaseCategoryName(purchase.category_id)}
                  </TD>
                  <TD className="text-right font-medium">
                    {formatCurrency(getPurchaseTotal(purchase.id))}
                  </TD>
                  <TD className="max-w-56 truncate text-xs text-muted">
                    {purchase.notes || "—"}
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/purchases/${purchase.id}`}
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
