"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency } from "@/lib/format";
import {
  getProductCategoryName,
  productCategories,
  products,
  type Product,
} from "@/lib/products";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const normalized = query.trim().toLowerCase();
  const isFiltered =
    normalized.length > 0 ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  const filtered = products.filter((product) => {
    const matchesQuery =
      normalized.length === 0 ||
      product.name.toLowerCase().includes(normalized) ||
      product.sku.toLowerCase().includes(normalized);
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? product.is_active : !product.is_active);
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = isFiltered && filtered.length === 0;

  const activeCount = filtered.filter((product) => product.is_active).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Produk"
        description="Daftar produk yang dijual beserta kategori, satuan, dan harga jualnya."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Produk
          </Button>
        }
      />

      <SummaryCards columns={2}>
        <SummaryCard label="Total Produk" value={filtered.length} />
        <SummaryCard label="Produk Aktif" value={activeCount} />
      </SummaryCards>

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari nama atau SKU…"
            aria-label="Cari produk berdasarkan nama atau SKU"
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
                {productCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:w-40">
              <Select
                aria-label="Filter status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
            </div>
          </div>
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={7}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada produk"
        emptyDescription="Belum ada data produk yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Produk
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
        <Table className="min-w-[760px]">
          <THead>
            <tr>
              <TH>SKU</TH>
              <TH>Nama Produk</TH>
              <TH>Kategori</TH>
              <TH className="hidden md:table-cell">Satuan</TH>
              <TH className="text-right">Harga Jual</TH>
              <TH>Status</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((product) => (
              <TR key={product.id}>
                <TD className="font-mono text-xs text-muted">{product.sku}</TD>
                <TD className="font-medium">{product.name}</TD>
                <TD className="text-muted">
                  {getProductCategoryName(product.category_id)}
                </TD>
                <TD className="hidden text-muted md:table-cell">
                  {product.unit}
                </TD>
                <TD className="text-right font-medium">
                  {formatCurrency(product.selling_price)}
                </TD>
                <TD>
                  <Badge variant={product.is_active ? "success" : "neutral"}>
                    {product.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${product.name}`}
                    onEdit={() => setEditing(product)}
                    onDelete={() => setDeleting(product)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <ProductFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <ProductFormDialog
          open
          mode="edit"
          product={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Produk?"
          description={`Apakah Anda yakin ingin menghapus produk "${deleting.name}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
