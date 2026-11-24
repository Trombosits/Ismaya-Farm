"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createFeedPurchase,
  updateFeedPurchase,
} from "@/lib/actions/feed";
import type { ActionState } from "@/lib/actions/types";
import type {
  FeedPurchase,
  FeedPurchaseItem,
  FeedType,
} from "@/lib/feed";
import { formatCurrency } from "@/lib/format";

interface PurchaseItemRow {
  key: string;
  feed_type_id: string;
  quantity: string;
  unit_price: string;
}

interface FeedPurchaseFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  purchase?: FeedPurchase | null;
  initialItems?: FeedPurchaseItem[];
  feedTypes: FeedType[];
}

function buildInitialItems(items?: FeedPurchaseItem[]): PurchaseItemRow[] {
  if (items && items.length > 0) {
    return items.map((item, index) => ({
      key: `row-${index}`,
      feed_type_id: item.feed_type_id,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
    }));
  }
  return [{ key: "row-0", feed_type_id: "", quantity: "", unit_price: "" }];
}

export function FeedPurchaseFormDialog({
  open,
  onClose,
  mode,
  purchase,
  initialItems,
  feedTypes,
}: FeedPurchaseFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "feed-purchase-form";
  const keyCounter = useRef(1000);

  const [items, setItems] = useState<PurchaseItemRow[]>(() =>
    buildInitialItems(initialItems),
  );
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);

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
      { key, feed_type_id: "", quantity: "", unit_price: "" },
    ]);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(null);

    const validItems = items.filter(
      (item) =>
        item.feed_type_id !== "" &&
        Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      setItemsError("Minimal satu item pakan dengan jumlah > 0 wajib diisi.");
      return;
    }
    setItemsError(null);

    const formData = new FormData(event.currentTarget);
    formData.set(
      "items",
      JSON.stringify(
        validItems.map((item) => ({
          feed_type_id: Number(item.feed_type_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price) || 0,
        })),
      ),
    );

    startTransition(async () => {
      const result =
        isEdit && purchase
          ? await updateFeedPurchase(Number(purchase.id), formData)
          : await createFeedPurchase(formData);

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
      title={isEdit ? "Edit Pembelian Pakan" : "Tambah Pembelian Pakan"}
      description={
        isEdit
          ? "Perbarui data pembelian pakan."
          : "Catat pembelian pakan beserta itemnya."
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

        <FormSection title="Informasi Pembelian">
          <Field
            label="Tanggal"
            htmlFor="fp-date"
            required
            error={fieldErrors?.purchase_date}
          >
            <Input
              id="fp-date"
              name="purchase_date"
              type="date"
              defaultValue={purchase?.purchase_date ?? ""}
              disabled={pending}
            />
          </Field>
          <Field
            label="Supplier"
            htmlFor="fp-supplier"
            required
            error={fieldErrors?.supplier}
          >
            <Input
              id="fp-supplier"
              name="supplier"
              defaultValue={purchase?.supplier ?? ""}
              placeholder="Contoh: CV Pakan Sejahtera"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="No. Invoice"
            htmlFor="fp-invoice"
            error={fieldErrors?.invoice_number}
            hint="Boleh dikosongkan."
          >
            <Input
              id="fp-invoice"
              name="invoice_number"
              defaultValue={purchase?.invoice_number ?? ""}
              placeholder="Contoh: INV-2026-0920"
              autoComplete="off"
              className="font-mono"
              disabled={pending}
            />
          </Field>
        </FormSection>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Item Pakan
          </legend>

          <div className="hidden grid-cols-[minmax(0,1fr)_5rem_7rem_7rem_2rem] gap-2 px-1 text-[11px] font-semibold tracking-wider text-subtle uppercase sm:grid">
            <span>Jenis Pakan</span>
            <span>Qty</span>
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
                  className="grid grid-cols-1 gap-2 border-b border-border pb-3 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_7rem_2rem] sm:items-center sm:border-0 sm:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-subtle sm:hidden">
                      Jenis Pakan
                    </span>
                    <Select
                      aria-label="Jenis pakan"
                      value={item.feed_type_id}
                      disabled={pending}
                      onChange={(event) =>
                        updateItem(item.key, {
                          feed_type_id: event.target.value,
                        })
                      }
                    >
                      <option value="" disabled>
                        Pilih pakan
                      </option>
                      {feedTypes.map((feed) => (
                        <option key={feed.id} value={feed.id}>
                          {feed.name}
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
                      step="any"
                      value={item.quantity}
                      disabled={pending}
                      onChange={(event) =>
                        updateItem(item.key, { quantity: event.target.value })
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
                      step="any"
                      value={item.unit_price}
                      disabled={pending}
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
                    disabled={items.length === 1 || pending}
                    onClick={() => removeItem(item.key)}
                    className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-40 sm:justify-self-center"
                  >
                    <Trash aria-hidden className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {itemsError ? (
            <p className="text-xs text-danger" role="alert">
              {itemsError}
            </p>
          ) : null}

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
            disabled={pending}
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
