"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FeedType } from "@/lib/feed";

interface FeedTypeFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  feedType?: FeedType | null;
}

export function FeedTypeFormDialog({
  open,
  onClose,
  mode,
  feedType,
}: FeedTypeFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "feed-type-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Jenis Pakan" : "Tambah Jenis Pakan"}
      description={
        isEdit
          ? "Perbarui informasi jenis pakan."
          : "Lengkapi data untuk menambahkan jenis pakan baru."
      }
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
        <FormSection title="Informasi Pakan">
          <Field label="Nama" htmlFor="ft-name" required>
            <Input
              id="ft-name"
              name="name"
              defaultValue={feedType?.name ?? ""}
              placeholder="Contoh: Konsentrat Sapi"
              autoComplete="off"
            />
          </Field>
          <Field
            label="Satuan"
            htmlFor="ft-unit"
            required
            hint="Contoh: kg, sak, karung."
          >
            <Input
              id="ft-unit"
              name="unit"
              defaultValue={feedType?.unit ?? ""}
              placeholder="kg"
              autoComplete="off"
            />
          </Field>
          <Field label="Minimum Stok" htmlFor="ft-min" required>
            <Input
              id="ft-min"
              name="minimum_stock"
              type="number"
              min={0}
              defaultValue={feedType?.minimum_stock ?? 0}
            />
          </Field>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ft-active">Status Aktif</Label>
            <div className="flex h-9 items-center gap-2">
              <Checkbox
                id="ft-active"
                name="is_active"
                defaultChecked={feedType?.is_active ?? true}
              />
              <span className="text-sm text-muted">
                Pakan aktif digunakan
              </span>
            </div>
          </div>
        </FormSection>
      </form>
    </Dialog>
  );
}
