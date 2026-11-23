"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash } from "lucide-react";

import { PurchaseFormDialog } from "@/components/purchases/purchase-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeader } from "@/components/ui/section";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { deletePurchase } from "@/lib/actions/purchases";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import type { PurchaseCategory, PurchaseDetail } from "@/lib/purchases";

export function PurchaseDetailClient({
  detail,
  categories,
}: {
  detail: PurchaseDetail | null;
  categories: PurchaseCategory[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  if (!detail) {
    return (
      <EmptyState
        title="Data pembelian tidak ditemukan"
        description="Transaksi pembelian yang Anda cari tidak tersedia atau telah dihapus."
        action={
          <Button onClick={() => router.push("/purchases")}>
            Kembali ke Pembelian
          </Button>
        }
      />
    );
  }

  const { purchase, items } = detail;
  const supplierName = purchase.supplier || "—";
  const categoryName =
    categoryNameById.get(purchase.category_id) ?? "—";

  function handleDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deletePurchase(Number(purchase.id));
      if (result.ok) {
        router.push("/purchases");
        router.refresh();
      } else {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/purchases"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
      >
        <ChevronLeft aria-hidden className="size-3.5" />
        Pembelian
      </Link>

      <PageHeader
        title={supplierName}
        description={`${categoryName} · ${formatDate(purchase.purchase_date)}`}
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => setEditOpen(true)}
            >
              <Pencil aria-hidden className="size-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              <Trash aria-hidden className="size-4" />
              Hapus
            </Button>
          </div>
        }
      />

      <div className="flex flex-col divide-y divide-border">
        <Section className="py-5 first:pt-0">
          <SectionHeader title="Informasi Pembelian" />
          <DescriptionList columns={2}>
            <DescriptionItem label="Tanggal">
              {formatDate(purchase.purchase_date)}
            </DescriptionItem>
            <DescriptionItem label="Supplier">{supplierName}</DescriptionItem>
            <DescriptionItem label="Kategori">{categoryName}</DescriptionItem>
            <DescriptionItem label="Total">
              <span className="font-semibold">
                {formatCurrency(purchase.total_amount)}
              </span>
            </DescriptionItem>
          </DescriptionList>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
              Catatan
            </span>
            <p className="text-sm text-ink">
              {purchase.notes || "Tidak ada catatan."}
            </p>
          </div>
        </Section>

        <Section className="py-5 last:pb-0">
          <SectionHeader title="Item" />
          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
              Belum ada item pembelian.
            </p>
          ) : (
            <Table className="min-w-[640px]">
              <THead>
                <tr>
                  <TH>Nama Item</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH>Satuan</TH>
                  <TH className="text-right">Harga Satuan</TH>
                  <TH className="text-right">Subtotal</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((item) => (
                  <TR key={item.id}>
                    <TD className="font-medium">{item.item_name}</TD>
                    <TD className="text-right">
                      {formatNumber(item.quantity)}
                    </TD>
                    <TD className="text-muted">{item.unit}</TD>
                    <TD className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TD>
                    <TD className="text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Section>
      </div>

      {editOpen ? (
        <PurchaseFormDialog
          open
          mode="edit"
          purchase={purchase}
          initialItems={items}
          categories={categories}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          loading={deletePending}
          error={deleteError ?? undefined}
          title="Hapus Pembelian?"
          description={`Apakah Anda yakin ingin menghapus pembelian tanggal ${formatDate(
            purchase.purchase_date,
          )}?`}
          confirmLabel="Hapus"
          onClose={() => {
            if (deletePending) return;
            setDeleteOpen(false);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
