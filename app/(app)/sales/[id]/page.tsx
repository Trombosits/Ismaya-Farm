"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash } from "lucide-react";

import { SaleFormDialog } from "@/components/sales/sale-form-dialog";
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
import { formatDate, getLivestockReference } from "@/lib/livestock";
import {
  getProductName,
  getProductUnit,
  getSaleById,
  getSaleItemLivestock,
  getSaleItems,
  getSaleTotal,
} from "@/lib/products";

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sale = getSaleById(params.id);

  if (!sale) {
    return (
      <EmptyState
        title="Data penjualan tidak ditemukan"
        description="Transaksi penjualan yang Anda cari tidak tersedia atau telah dihapus."
        action={
          <Button onClick={() => router.push("/sales")}>
            Kembali ke Penjualan
          </Button>
        }
      />
    );
  }

  const items = getSaleItems(sale.id);
  const total = getSaleTotal(sale.id);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/sales"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
      >
        <ChevronLeft aria-hidden className="size-3.5" />
        Penjualan
      </Link>

      <PageHeader
        title={sale.invoice_number}
        description={`${sale.customer_name} · ${formatDate(sale.sale_date)}`}
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
          <SectionHeader title="Informasi Penjualan" />
          <DescriptionList columns={3}>
            <DescriptionItem label="Invoice">
              <span className="font-mono font-semibold">
                {sale.invoice_number}
              </span>
            </DescriptionItem>
            <DescriptionItem label="Tanggal">
              {formatDate(sale.sale_date)}
            </DescriptionItem>
            <DescriptionItem label="Customer">
              {sale.customer_name}
            </DescriptionItem>
            <DescriptionItem label="Telepon">
              {sale.customer_phone || "—"}
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
              {sale.notes || "Tidak ada catatan."}
            </p>
          </div>
        </Section>

        <Section className="py-5 last:pb-0">
          <SectionHeader title="Item" />
          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
              Belum ada item penjualan.
            </p>
          ) : (
            <Table className="min-w-[620px]">
              <THead>
                <tr>
                  <TH>Produk</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH className="text-right">Harga</TH>
                  <TH className="text-right">Subtotal</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((item) => {
                  const livestock = getSaleItemLivestock(item.id);
                  return (
                    <TR key={item.id}>
                      <TD>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {getProductName(item.product_id)}
                          </span>
                          <span className="text-[11px] text-subtle">
                            Satuan {getProductUnit(item.product_id)}
                          </span>
                          {livestock.length > 0 ? (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {livestock.map((ref) => (
                                <Link
                                  key={ref.id}
                                  href={`/livestock/${ref.livestock_id}`}
                                  className="inline-flex items-center rounded-sm border border-border bg-canvas px-1.5 py-0.5 text-[11px] text-brand-700 hover:underline"
                                >
                                  {getLivestockReference(ref.livestock_id)}
                                </Link>
                              ))}
                            </span>
                          ) : null}
                        </div>
                      </TD>
                      <TD className="text-right">
                        {formatNumber(item.quantity)}
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
          )}
        </Section>
      </div>

      {editOpen ? (
        <SaleFormDialog
          open
          mode="edit"
          sale={sale}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          title="Hapus Penjualan?"
          description={`Apakah Anda yakin ingin menghapus penjualan "${sale.invoice_number}"?`}
          confirmLabel="Hapus"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => setDeleteOpen(false)}
        />
      ) : null}
    </div>
  );
}
