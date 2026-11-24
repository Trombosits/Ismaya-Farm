"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createInventoryTransaction,
  updateInventoryTransaction,
} from "@/lib/actions/feed";
import type { ActionState } from "@/lib/actions/types";
import {
  REFERENCE_TYPE_LABEL,
  TRANSACTION_TYPE_LABEL,
  type FeedInventoryTransaction,
  type FeedPurchase,
  type FeedReferenceType,
  type FeedType,
  type InventoryTransactionType,
} from "@/lib/feed";

interface InventoryTransactionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  transaction?: FeedInventoryTransaction | null;
  defaultFeedTypeId?: string;
  feedTypes: FeedType[];
  purchases: FeedPurchase[];
}

export function InventoryTransactionFormDialog({
  open,
  onClose,
  mode,
  transaction,
  defaultFeedTypeId,
  feedTypes,
  purchases,
}: InventoryTransactionFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "inventory-transaction-form";

  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);
  const [referenceType, setReferenceType] = useState<FeedReferenceType>(
    transaction?.reference_type ?? "feed_purchase",
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && transaction
          ? await updateInventoryTransaction(Number(transaction.id), formData)
          : await createInventoryTransaction(formData);

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
      title={isEdit ? "Edit Transaksi Stok" : "Catat Transaksi Stok"}
      description="Catat pergerakan stok pakan masuk atau keluar."
      className="max-w-2xl"
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
        className="scrollbar-thin flex max-h-[70vh] flex-col gap-6 overflow-y-auto"
      >
        {generalError ? (
          <p
            role="alert"
            className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {generalError}
          </p>
        ) : null}

        <FormSection title="Transaksi">
          <Field
            label="Jenis Pakan"
            htmlFor="it-feed"
            required
            error={fieldErrors?.feed_type_id}
          >
            <Select
              id="it-feed"
              name="feed_type_id"
              defaultValue={transaction?.feed_type_id ?? defaultFeedTypeId ?? ""}
              disabled={pending}
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
          </Field>
          <Field
            label="Tipe Transaksi"
            htmlFor="it-type"
            required
            error={fieldErrors?.transaction_type}
          >
            <Select
              id="it-type"
              name="transaction_type"
              defaultValue={transaction?.transaction_type ?? "in"}
              disabled={pending}
            >
              {(
                Object.keys(TRANSACTION_TYPE_LABEL) as InventoryTransactionType[]
              ).map((type) => (
                <option key={type} value={type}>
                  {TRANSACTION_TYPE_LABEL[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Tanggal"
            htmlFor="it-date"
            required
            error={fieldErrors?.transaction_date}
          >
            <Input
              id="it-date"
              name="transaction_date"
              type="date"
              defaultValue={transaction?.transaction_date ?? ""}
              disabled={pending}
            />
          </Field>
          <Field
            label="Quantity"
            htmlFor="it-qty"
            required
            error={fieldErrors?.quantity}
          >
            <Input
              id="it-qty"
              name="quantity"
              type="number"
              min={0}
              step="any"
              defaultValue={transaction?.quantity ?? ""}
              disabled={pending}
            />
          </Field>
          <Field
            label="Harga Satuan"
            htmlFor="it-price"
            hint="Diisi untuk transaksi masuk."
            error={fieldErrors?.unit_price}
          >
            <Input
              id="it-price"
              name="unit_price"
              type="number"
              min={0}
              step="any"
              defaultValue={transaction?.unit_price ?? ""}
              disabled={pending}
            />
          </Field>
        </FormSection>

        <FormSection title="Referensi">
          <Field
            label="Reference Type"
            htmlFor="it-ref-type"
            required
            error={fieldErrors?.reference_type}
          >
            <Select
              id="it-ref-type"
              name="reference_type"
              value={referenceType}
              disabled={pending}
              onChange={(event) =>
                setReferenceType(event.target.value as FeedReferenceType)
              }
            >
              {(Object.keys(REFERENCE_TYPE_LABEL) as FeedReferenceType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {REFERENCE_TYPE_LABEL[type]}
                  </option>
                ),
              )}
            </Select>
          </Field>
          {referenceType === "feed_purchase" ? (
            <Field label="Reference" htmlFor="it-ref">
              <Select
                id="it-ref"
                name="reference_id"
                defaultValue={transaction?.reference_id ?? ""}
                disabled={pending}
              >
                <option value="">Tidak ditautkan</option>
                {purchases.map((purchase) => (
                  <option key={purchase.id} value={purchase.id}>
                    {(purchase.invoice_number || "Tanpa invoice") +
                      ` — ${purchase.supplier || "Tanpa supplier"}`}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field
              label="Reference"
              htmlFor="it-ref"
              hint="Transaksi pemakaian tidak memerlukan referensi."
            >
              <Input id="it-ref" value="Pemakaian" disabled readOnly />
            </Field>
          )}
        </FormSection>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Catatan
          </legend>
          <Textarea
            name="notes"
            aria-label="Catatan"
            rows={3}
            defaultValue={transaction?.notes ?? ""}
            placeholder="Catatan tambahan mengenai transaksi ini…"
            disabled={pending}
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
