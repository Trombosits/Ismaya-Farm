"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSale, updateSale } from "@/lib/actions/sales";
import type { ActionState } from "@/lib/actions/types";
import { formatCurrency } from "@/lib/format";
import type { Livestock, LivestockBreed } from "@/lib/livestock";
import type {
  Product,
  Sale,
  SaleItemDetail,
} from "@/lib/products";

interface SaleItemRow {
  key: string;
  product_id: string;
  quantity: string;
  unit_price: string;
  livestockIds: string[];
}

interface SaleFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  sale?: Sale | null;
  saleItems?: SaleItemDetail[];
  products: Product[];
  livestock: Livestock[];
  breeds: LivestockBreed[];
}

function buildInitialItems(saleItems?: SaleItemDetail[]): SaleItemRow[] {
  if (saleItems && saleItems.length > 0) {
    return saleItems.map((item, index) => ({
      key: `row-${index}`,
      product_id: item.product_id,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
      livestockIds: item.livestock_ids,
    }));
  }
  return [
    { key: "row-0", product_id: "", quantity: "", unit_price: "", livestockIds: [] },
  ];
}

export function SaleFormDialog({
  open,
  onClose,
  mode,
  sale,
  saleItems,
  products,
  livestock,
  breeds,
}: SaleFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "sale-form";
  const keyCounter = useRef(1000);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  const [items, setItems] = useState<SaleItemRow[]>(() =>
    buildInitialItems(saleItems),
  );

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

  const total = items.reduce((sum, item) => {
    const value = Number(item.quantity) * Number(item.unit_price);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  function updateItem(key: string, patch: Partial<SaleItemRow>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    const key = `row-${keyCounter.current++}`;
    setItems((current) => [
      ...current,
      { key, product_id: "", quantity: "", unit_price: "", livestockIds: [] },
    ]);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function addLivestock(key: string, livestockId: string) {
    if (!livestockId) return;
    setItems((current) =>
      current.map((item) =>
        item.key === key && !item.livestockIds.includes(livestockId)
          ? { ...item, livestockIds: [...item.livestockIds, livestockId] }
          : item,
      ),
    );
  }

  function removeLivestock(key: string, livestockId: string) {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              livestockIds: item.livestockIds.filter(
                (id) => id !== livestockId,
              ),
            }
          : item,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set(
      "items",
      JSON.stringify(
        items.map((item) => ({
          product_id: item.product_id === "" ? 0 : Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          livestock_ids: item.livestockIds.map((id) => Number(id)),
        })),
      ),
    );
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && sale
          ? await updateSale(Number(sale.id), formData)
          : await createSale(formData);

      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setState(result);
      }
    });
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const generalError = state && !state.ok ? state.message : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Penjualan" : "Tambah Penjualan"}
      description={
        isEdit
          ? "Perbarui data penjualan."
          : "Catat penjualan beserta itemnya."
      }
      className="max-w-3xl"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            Batal
          </Button>
          <Button type="submit" form={formId} size="sm" loading={pending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="scrollbar-thin flex max-h-[72vh] flex-col gap-6 overflow-y-auto"
      >
        {generalError ? (
          <p
            role="alert"
            className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {generalError}
          </p>
        ) : null}

        <FormSection title="Informasi Penjualan">
          <Field
            label="Tanggal"
            htmlFor="sl-date"
            required
            error={fieldErrors?.sale_date}
          >
            <Input
              id="sl-date"
              name="sale_date"
              type="date"
              defaultValue={sale?.sale_date ?? ""}
              disabled={pending}
            />
          </Field>
          <Field
            label="Nama Customer"
            htmlFor="sl-customer"
            required
            error={fieldErrors?.customer_name}
          >
            <Input
              id="sl-customer"
              name="customer_name"
              defaultValue={sale?.customer_name ?? ""}
              placeholder="Contoh: Toko Sembako Bu Sari"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="No. Telepon"
            htmlFor="sl-phone"
            error={fieldErrors?.customer_phone}
          >
            <Input
              id="sl-phone"
              name="customer_phone"
              defaultValue={sale?.customer_phone ?? ""}
              placeholder="0812-3456-7890"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="No. Invoice"
            htmlFor="sl-invoice"
            error={fieldErrors?.invoice_number}
            hint="Kosongkan untuk dibuat otomatis."
          >
            <Input
              id="sl-invoice"
              name="invoice_number"
              defaultValue={sale?.invoice_number ?? ""}
              placeholder="Contoh: INV-S-2026-0920"
              autoComplete="off"
              className="font-mono"
              disabled={pending}
            />
          </Field>
        </FormSection>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Item Penjualan
          </legend>

          <div className="hidden grid-cols-[minmax(0,1fr)_5rem_7rem_7rem_2rem] gap-2 px-1 text-[11px] font-semibold tracking-wider text-subtle uppercase sm:grid">
            <span>Produk</span>
            <span>Qty</span>
            <span>Harga Satuan</span>
            <span className="text-right">Subtotal</span>
            <span className="sr-only">Aksi</span>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const subtotal =
                Number(item.quantity) * Number(item.unit_price) || 0;
              const availableLivestock = livestock.filter(
                (animal) =>
                  !item.livestockIds.includes(String(animal.id)),
              );
              return (
                <div
                  key={item.key}
                  className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_7rem_2rem] sm:items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-subtle sm:hidden">
                        Produk
                      </span>
                      <Select
                        aria-label="Produk"
                        value={item.product_id}
                        disabled={pending}
                        onChange={(event) =>
                          updateItem(item.key, {
                            product_id: event.target.value,
                          })
                        }
                      >
                        <option value="" disabled>
                          Pilih produk
                        </option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-subtle sm:hidden">
                        Qty
                      </span>
                      <Input
                        aria-label="Quantity"
                        type="number"
                        min={0}
                        value={item.quantity}
                        disabled={pending}
                        onChange={(event) =>
                          updateItem(item.key, {
                            quantity: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-subtle sm:hidden">
                        Harga Satuan
                      </span>
                      <Input
                        aria-label="Harga satuan"
                        type="number"
                        min={0}
                        value={item.unit_price}
                        disabled={pending}
                        onChange={(event) =>
                          updateItem(item.key, {
                            unit_price: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <span className="text-[11px] text-subtle sm:hidden">
                        Subtotal
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Hapus item"
                      disabled={pending || items.length === 1}
                      onClick={() => removeItem(item.key)}
                      className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-40 sm:justify-self-center"
                    >
                      <Trash aria-hidden className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
                      Referensi Ternak (opsional)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.livestockIds.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-sm border border-border bg-canvas px-1.5 py-0.5 text-[11px] text-ink"
                        >
                          {livestockLabel(id)}
                          <button
                            type="button"
                            aria-label={`Hapus referensi ${livestockLabel(id)}`}
                            disabled={pending}
                            onClick={() => removeLivestock(item.key, id)}
                            className="grid size-4 place-items-center rounded-sm text-subtle transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                          >
                            <X aria-hidden className="size-3" />
                          </button>
                        </span>
                      ))}
                      <div className="w-full sm:w-56">
                        <Select
                          aria-label="Tambah referensi ternak"
                          value=""
                          disabled={pending}
                          onChange={(event) =>
                            addLivestock(item.key, event.target.value)
                          }
                        >
                          <option value="">Tambah ternak…</option>
                          {availableLivestock.map((animal) => (
                            <option
                              key={animal.id}
                              value={String(animal.id)}
                            >
                              {animal.tag_code} —{" "}
                              {breedNameById.get(String(animal.breed_id)) ??
                                "—"}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addItem}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              <Plus aria-hidden className="size-3.5" />
              Tambah Item
            </Button>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-muted">Total Penjualan</span>
              <span className="text-sm font-semibold text-ink">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </fieldset>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Catatan
          </legend>
          <Textarea
            name="notes"
            aria-label="Catatan"
            rows={3}
            defaultValue={sale?.notes ?? ""}
            placeholder="Catatan tambahan mengenai penjualan ini…"
            disabled={pending}
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
