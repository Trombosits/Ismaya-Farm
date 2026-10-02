"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";
import {
  getPurchaseById,
  getPurchaseCategoryName,
  getPurchaseItemsByPurchase,
  getPurchaseTotal,
  getSupplierName,
} from "@/lib/purchases";

export default function PurchaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const purchase = getPurchaseById(params.id);

  if (!purchase) {
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

  const items = getPurchaseItemsByPurchase(purchase.id);
  const total = getPurchaseTotal(purchase.id);

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
        title={getSupplierName(purchase.supplier_id)}
        description={`${getPurchaseCategoryName(
          purchase.category_id,
        )} · ${formatDate(purchase.purchase_date)}`}
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
              onClick={() => setDeleteOpen(true)}
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
            <DescriptionItem label="Supplier">
              {getSupplierName(purchase.supplier_id)}
            </DescriptionItem>
            <DescriptionItem label="Kategori">
              {getPurchaseCategoryName(purchase.category_id)}
            </DescriptionItem>
            <DescriptionItem label="Total">
              <span className="font-semibold">{formatCurrency(total)}</span>
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
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Pembelian?"
          description={`Apakah Anda yakin ingin menghapus pembelian tanggal ${formatDate(
            purchase.purchase_date,
          )}?`}
          confirmLabel="Hapus"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => setDeleteOpen(false)}
        />
      ) : null}
    </div>
  );
}
