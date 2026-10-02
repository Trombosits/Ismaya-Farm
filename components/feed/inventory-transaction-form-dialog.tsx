"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  feedPurchases,
  feedTypes,
  getSupplierName,
  REFERENCE_TYPE_LABEL,
  TRANSACTION_TYPE_LABEL,
  type FeedInventoryTransaction,
  type InventoryTransactionType,
} from "@/lib/feed";

type ReferenceType = FeedInventoryTransaction["reference_type"];

interface InventoryTransactionFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  transaction?: FeedInventoryTransaction | null;
  defaultFeedTypeId?: string;
}

export function InventoryTransactionFormDialog({
  open,
  onClose,
  mode,
  transaction,
  defaultFeedTypeId,
}: InventoryTransactionFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "inventory-transaction-form";
  const [referenceType, setReferenceType] = useState<ReferenceType>(
    transaction?.reference_type ?? "feed_purchase",
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaksi Stok" : "Catat Transaksi Stok"}
      description="Catat pergerakan stok pakan masuk atau keluar."
      className="max-w-2xl"
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
        className="scrollbar-thin flex max-h-[70vh] flex-col gap-6 overflow-y-auto"
      >
        <FormSection title="Transaksi">
          <Field label="Jenis Pakan" htmlFor="it-feed" required>
            <Select
              id="it-feed"
              name="feed_type_id"
              defaultValue={transaction?.feed_type_id ?? defaultFeedTypeId ?? ""}
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
          <Field label="Tipe Transaksi" htmlFor="it-type" required>
            <Select
              id="it-type"
              name="transaction_type"
              defaultValue={transaction?.transaction_type ?? "in"}
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
          <Field label="Tanggal" htmlFor="it-date" required>
            <Input
              id="it-date"
              name="transaction_date"
              type="date"
              defaultValue={transaction?.transaction_date ?? ""}
            />
          </Field>
          <Field label="Quantity" htmlFor="it-qty" required>
            <Input
              id="it-qty"
              name="quantity"
              type="number"
              min={0}
              defaultValue={transaction?.quantity ?? ""}
            />
          </Field>
          <Field
            label="Harga Satuan"
            htmlFor="it-price"
            hint="Diisi untuk transaksi masuk."
          >
            <Input
              id="it-price"
              name="unit_price"
              type="number"
              min={0}
              defaultValue={transaction?.unit_price ?? ""}
            />
          </Field>
        </FormSection>

        <FormSection title="Referensi">
          <Field label="Reference Type" htmlFor="it-ref-type" required>
            <Select
              id="it-ref-type"
              name="reference_type"
              value={referenceType}
              onChange={(event) =>
                setReferenceType(event.target.value as ReferenceType)
              }
            >
              {(Object.keys(REFERENCE_TYPE_LABEL) as ReferenceType[]).map(
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
              >
                <option value="">Tidak ditautkan</option>
                {feedPurchases.map((purchase) => (
                  <option key={purchase.id} value={purchase.id}>
                    {purchase.invoice_number} —{" "}
                    {getSupplierName(purchase.supplier_id)}
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
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
