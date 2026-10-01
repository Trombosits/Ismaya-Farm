"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  feedTypes,
  TRANSACTION_TYPE_LABEL,
  type InventoryTransactionType,
} from "@/lib/feed";

interface InventoryTransactionFormDialogProps {
  onClose: () => void;
  defaultFeedTypeId?: string;
}

export function InventoryTransactionFormDialog({
  onClose,
  defaultFeedTypeId,
}: InventoryTransactionFormDialogProps) {
  const formId = "inventory-transaction-form";

  return (
    <Dialog
      open
      onClose={onClose}
      title="Catat Transaksi Stok"
      description="Catat stok pakan masuk atau keluar."
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
        className="flex flex-col gap-4"
      >
        <FormSection title="Transaksi">
          <Field label="Jenis Pakan" htmlFor="it-feed" required>
            <Select
              id="it-feed"
              name="feed_type_id"
              defaultValue={defaultFeedTypeId ?? ""}
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
              defaultValue="in"
            >
              {(Object.keys(TRANSACTION_TYPE_LABEL) as InventoryTransactionType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {TRANSACTION_TYPE_LABEL[type]}
                  </option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Tanggal" htmlFor="it-date" required>
            <Input id="it-date" name="transaction_date" type="date" />
          </Field>
          <Field label="Quantity" htmlFor="it-qty" required>
            <Input
              id="it-qty"
              name="quantity"
              type="number"
              min={0}
            />
          </Field>
          <Field
            label="Harga Satuan"
            htmlFor="it-price"
            hint="Diisi untuk transaksi masuk."
          >
            <Input id="it-price" name="unit_price" type="number" min={0} />
          </Field>
        </FormSection>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
            Catatan
          </legend>
          <Textarea
            name="notes"
            aria-label="Catatan"
            rows={3}
            placeholder="Catatan tambahan mengenai transaksi ini…"
          />
        </fieldset>
      </form>
    </Dialog>
  );
}
