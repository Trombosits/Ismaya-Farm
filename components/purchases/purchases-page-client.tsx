"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { PurchaseFormDialog } from "@/components/purchases/purchase-form-dialog";
import { Button } from "@/components/ui/button";
import { DataSectionHeading } from "@/components/ui/data-section-heading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SummaryCard, SummaryCards } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { deletePurchase } from "@/lib/actions/purchases";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import type {
  Purchase,
  PurchaseCategory,
  PurchaseDetail,
} from "@/lib/purchases";

const PAGE_SIZE = 10;

export function PurchasesPageClient({
  purchaseDetails,
  categories,
}: {
  purchaseDetails: PurchaseDetail[];
  categories: PurchaseCategory[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const purchases = useMemo(
    () => purchaseDetails.map((detail) => detail.purchase),
    [purchaseDetails],
  );

  const itemsByPurchase = useMemo(() => {
    const map = new Map<string, PurchaseDetail["items"]>();
    for (const detail of purchaseDetails) {
      map.set(detail.purchase.id, detail.items);
    }
    return map;
  }, [purchaseDetails]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  const supplierOptions = useMemo(
    () =>
      Array.from(
        new Set(
          purchases
            .map((purchase) => purchase.supplier.trim())
            .filter((name) => name.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [purchases],
  );

  const normalized = query.trim().toLowerCase();
  const isFiltered =
    normalized.length > 0 ||
    categoryFilter !== "all" ||
    supplierFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const filtered = purchases.filter((purchase) => {
    const matchesQuery =
      normalized.length === 0 ||
      purchase.supplier.toLowerCase().includes(normalized);
    const matchesCategory =
      categoryFilter === "all" || purchase.category_id === categoryFilter;
    const matchesSupplier =
      supplierFilter === "all" || purchase.supplier === supplierFilter;
    const matchesFrom = dateFrom === "" || purchase.purchase_date >= dateFrom;
    const matchesTo = dateTo === "" || purchase.purchase_date <= dateTo;
    return (
      matchesQuery &&
      matchesCategory &&
      matchesSupplier &&
      matchesFrom &&
      matchesTo
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;
  const panelState =
    viewState === "data" && purchases.length === 0 ? "empty" : viewState;

  const totalSpending = filtered.reduce(
    (sum, purchase) => sum + purchase.total_amount,
    0,
  );
  const latestPurchaseDate = filtered.reduce<string | null>(
    (max, purchase) =>
      max === null || purchase.purchase_date > max
        ? purchase.purchase_date
        : max,
    null,
  );

  function handleDelete() {
    if (!deleting) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deletePurchase(Number(deleting.id));
      if (result.ok) {
        setDeleting(null);
        router.refresh();
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pembelian"
        description="Catatan pembelian operasional beserta supplier, kategori, dan itemnya."
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

      <DataSectionHeading title="Daftar Pembelian" />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari supplier…"
            aria-label="Cari pembelian berdasarkan supplier"
            className="w-full sm:max-w-xs"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-48">
              <Select
                aria-label="Filter kategori"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
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
                onChange={(event) => {
                  setSupplierFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Semua Supplier</option>
                {supplierOptions.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <Input
                type="date"
                aria-label="Tanggal mulai"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className="sm:w-36"
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
                className="sm:w-36"
              />
            </div>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={panelState}
        onRetry={() => setViewState("data")}
        columns={5}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada data pembelian"
        emptyDescription="Belum ada transaksi pembelian yang tersedia."
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
        <Table className="min-w-[720px]">
          <THead>
            <tr>
              <TH>Tanggal</TH>
              <TH>Supplier</TH>
              <TH>Kategori</TH>
              <TH className="text-right">Total</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((purchase) => (
              <TR key={purchase.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(purchase.purchase_date)}
                </TD>
                <TD className="font-medium">{purchase.supplier || "—"}</TD>
                <TD className="text-muted">
                  {categoryNameById.get(purchase.category_id) ?? "—"}
                </TD>
                <TD className="text-right font-medium">
                  {formatCurrency(purchase.total_amount)}
                </TD>
                <TD>
                  <RowActions
                    label="Aksi pembelian"
                    onView={() => router.push(`/purchases/${purchase.id}`)}
                    onEdit={() => setEditing(purchase)}
                    onDelete={() => {
                      setDeleteError(null);
                      setDeleting(purchase);
                    }}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <PurchaseFormDialog
          open
          mode="create"
          categories={categories}
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <PurchaseFormDialog
          open
          mode="edit"
          purchase={editing}
          initialItems={itemsByPurchase.get(editing.id) ?? []}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          loading={deletePending}
          error={deleteError ?? undefined}
          title="Hapus Pembelian?"
          description={`Apakah Anda yakin ingin menghapus pembelian tanggal ${formatDate(
            deleting.purchase_date,
          )}?`}
          confirmLabel="Hapus"
          onClose={() => {
            if (deletePending) return;
            setDeleting(null);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
