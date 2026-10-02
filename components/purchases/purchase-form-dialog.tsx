"use client";

import { useRef, useState } from "react";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import {
  purchaseCategories,
  suppliers,
  type Purchase,
  type PurchaseItem,
} from "@/lib/purchases";

interface PurchaseItemRow {
  key: string;
  item_name: string;
  quantity: string;
  unit: string;
  unit_price: string;
}

interface PurchaseFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  purchase?: Purchase | null;
  initialItems?: PurchaseItem[];
}

function buildInitialItems(items?: PurchaseItem[]): PurchaseItemRow[] {
  if (items && items.length > 0) {
    return items.map((item, index) => ({
      key: `row-${index}`,
      item_name: item.item_name,
      quantity: String(item.quantity),
      unit: item.unit,
      unit_price: String(item.unit_price),
    }));
  }
  return [
    { key: "row-0", item_name: "", quantity: "", unit: "", unit_price: "" },
  ];
}

export function PurchaseFormDialog({
  open,
  onClose,
  mode,
  purchase,
  initialItems,
}: PurchaseFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "purchase-form";
  const keyCounter = useRef(1000);

  const [items, setItems] = useState<PurchaseItemRow[]>(() =>
    buildInitialItems(initialItems),
  );

  const total = items.reduce((sum, item) => {
    const value = Number(item.quantity) * Number(item.unit_price);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  function updateItem(key: string, patch: Partial<PurchaseItemRow>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    const key = `row-${keyCounter.current++}`;
    setItems((current) => [
      ...current,
      { key, item_name: "", quantity: "", unit: "", unit_price: "" },
    ]);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pembelian" : "Tambah Pembelian"}
      description={
        isEdit
          ? "Perbarui data pembelian."
          : "Catat pembelian beserta itemnya."
      }
      className="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form={formId} size="sm">
            Simpan
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
        className="scrollbar-thin flex max-h-[72vh] flex-col gap-6 overflow-y-auto"
      >
        <FormSection title="Informasi Pembelian">
          <Field label="Tanggal" htmlFor="pu-date" required>
            <Input
              id="pu-date"
              name="purchase_date"
              type="date"
              defaultValue={purchase?.purchase_date ?? ""}
            />
          </Field>
          <Field label="Supplier" htmlFor="pu-supplier" required>
            <Select
              id="pu-supplier"
              name="supplier_id"
              defaultValue={purchase?.supplier_id ?? ""}
            >
              <option value="" disabled>
                Pilih supplier
              </option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Kategori" htmlFor="pu-category" required>
            <Select
              id="pu-category"
              name="category_id"
              defaultValue={purchase?.category_id ?? ""}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {purchaseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </FormSection>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Item Pembelian
          </legend>

          <div className="hidden grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_7rem_7rem_2rem] gap-2 px-1 text-[11px] font-semibold tracking-wider text-subtle uppercase sm:grid">
            <span>Nama Item</span>
            <span>Qty</span>
            <span>Satuan</span>
            <span>Harga Satuan</span>
            <span className="text-right">Subtotal</span>
            <span className="sr-only">Aksi</span>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const subtotal =
                Number(item.quantity) * Number(item.unit_price) || 0;
              return (
                <div
                  key={item.key}
                  className="grid grid-cols-1 gap-2 border-b border-border pb-3 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_7rem_7rem_2rem] sm:items-center sm:border-0 sm:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-subtle sm:hidden">
                      Nama Item
                    </span>
                    <Input
                      aria-label="Nama item"
                      value={item.item_name}
                      placeholder="Contoh: Vaksin ND"
                      onChange={(event) =>
                        updateItem(item.key, { item_name: event.target.value })
                      }
                    />
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
                      onChange={(event) =>
                        updateItem(item.key, { quantity: event.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-subtle sm:hidden">
                      Satuan
                    </span>
                    <Input
                      aria-label="Satuan"
                      value={item.unit}
                      placeholder="buah"
                      onChange={(event) =>
                        updateItem(item.key, { unit: event.target.value })
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
                      onChange={(event) =>
                        updateItem(item.key, { unit_price: event.target.value })
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
                    disabled={items.length === 1}
                    onClick={() => removeItem(item.key)}
                    className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-40 sm:justify-self-center"
                  >
                    <Trash aria-hidden className="size-3.5" />
                  </button>
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
              className="w-full sm:w-auto"
            >
              <Plus aria-hidden className="size-3.5" />
              Tambah Item
            </Button>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-muted">Total Pembelian</span>
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
            defaultValue={purchase?.notes ?? ""}
            placeholder="Catatan tambahan mengenai pembelian ini…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
