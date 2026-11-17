"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { deleteSale } from "@/lib/actions/sales";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate, type Livestock, type LivestockBreed } from "@/lib/livestock";
import type { Product, SaleDetail } from "@/lib/products";

export function SaleDetailClient({
  detail,
  products,
  livestock,
  breeds,
}: {
  detail: SaleDetail | null;
  products: Product[];
  livestock: Livestock[];
  breeds: LivestockBreed[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) map.set(product.id, product);
    return map;
  }, [products]);

  const breedNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const breed of breeds) map.set(String(breed.id), breed.name);
    return map;
  }, [breeds]);

  const livestockById = useMemo(() => {
    const map = new Map<string, Livestock>();
    for (const animal of livestock) map.set(String(animal.id), animal);
    return map;
  }, [livestock]);

  function livestockLabel(id: string): string {
    const animal = livestockById.get(id);
    if (!animal) return "Tidak tercatat";
    return `${animal.tag_code} — ${breedNameById.get(String(animal.breed_id)) ?? "—"}`;
  }

  function handleDelete() {
    if (!detail) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteSale(Number(detail.sale.id));
      if (result.ok) {
        setDeleteOpen(false);
        router.push("/sales");
        router.refresh();
      } else {
        setDeleteError(result.message);
      }
    });
  }

  if (!detail) {
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

  const { sale, items } = detail;

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
              <span className="font-semibold">
                {formatCurrency(sale.total_amount)}
              </span>
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
                  const product = productById.get(item.product_id);
                  return (
                    <TR key={item.id}>
                      <TD>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {product?.name ?? "—"}
                          </span>
                          <span className="text-[11px] text-subtle">
                            Satuan {product?.unit ?? ""}
                          </span>
                          {item.livestock_ids.length > 0 ? (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {item.livestock_ids.map((livestockId) => (
                                <Link
                                  key={livestockId}
                                  href={`/livestock/${livestockId}`}
                                  className="inline-flex items-center rounded-sm border border-border bg-canvas px-1.5 py-0.5 text-[11px] text-brand-700 hover:underline"
                                >
                                  {livestockLabel(livestockId)}
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
          saleItems={items}
          products={products}
          livestock={livestock}
          breeds={breeds}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      {deleteOpen ? (
        <ConfirmDialog
          open
          destructive
          loading={deletePending}
          error={deleteError ?? undefined}
          title="Hapus Penjualan?"
          description={`Apakah Anda yakin ingin menghapus penjualan "${sale.invoice_number}"?`}
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
