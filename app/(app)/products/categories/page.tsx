"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  TableStatePreview,
  type TableViewState,
} from "@/components/livestock/table-state-preview";
import { ProductCategoryFormDialog } from "@/components/products/product-category-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/ui/row-actions";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TableStatePanel } from "@/components/ui/table-state-panel";
import { TableToolbar, TableToolbarGroup } from "@/components/ui/table-toolbar";
import { productCategories, type ProductCategory } from "@/lib/products";

const PAGE_SIZE = 10;

export default function ProductCategoriesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<TableViewState>("data");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [deleting, setDeleting] = useState<ProductCategory | null>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = productCategories.filter(
    (category) =>
      normalized.length === 0 ||
      category.name.toLowerCase().includes(normalized),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const searchEmpty = normalized.length > 0 && filtered.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Kategori Produk"
        description="Master data kategori untuk pengelompokan produk yang dijual."
        actions={
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
            <Plus aria-hidden className="size-4" />
            Tambah Kategori
          </Button>
        }
      />

      <TableToolbar>
        <TableToolbarGroup className="sm:flex-1">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari kategori produk…"
            aria-label="Cari kategori produk berdasarkan nama"
            className="w-full sm:max-w-xs"
          />
        </TableToolbarGroup>
        <TableToolbarGroup>
          <TableStatePreview value={viewState} onChange={setViewState} />
        </TableToolbarGroup>
      </TableToolbar>

      <TableStatePanel
        state={viewState}
        onRetry={() => setViewState("data")}
        columns={3}
        searchEmpty={searchEmpty}
        emptyTitle="Belum ada kategori produk"
        emptyDescription="Belum ada data kategori produk yang tersedia."
        emptyAction={
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden className="size-4" />
            Tambah Kategori
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
        <Table className="min-w-[480px]">
          <THead>
            <tr>
              <TH>Nama Kategori</TH>
              <TH>Status</TH>
              <TH className="w-14 text-right">Aksi</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map((category) => (
              <TR key={category.id}>
                <TD className="font-medium">{category.name}</TD>
                <TD>
                  <Badge variant={category.is_active ? "success" : "neutral"}>
                    {category.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TD>
                <TD>
                  <RowActions
                    label={`Aksi untuk ${category.name}`}
                    onEdit={() => setEditing(category)}
                    onDelete={() => setDeleting(category)}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableStatePanel>

      {addOpen ? (
        <ProductCategoryFormDialog
          open
          mode="create"
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editing ? (
        <ProductCategoryFormDialog
          open
          mode="edit"
          category={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Kategori Produk?"
          description={`Apakah Anda yakin ingin menghapus kategori "${deleting.name}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleting(null)}
          onConfirm={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
