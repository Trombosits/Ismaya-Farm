"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PurchaseCategory } from "@/lib/purchases";

interface PurchaseCategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  category?: PurchaseCategory | null;
}

export function PurchaseCategoryFormDialog({
  open,
  onClose,
  mode,
  category,
}: PurchaseCategoryFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "purchase-category-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kategori Pembelian" : "Tambah Kategori Pembelian"}
      description={
        isEdit
          ? "Perbarui informasi kategori pembelian."
          : "Lengkapi data untuk menambahkan kategori pembelian baru."
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
        <Field label="Nama" htmlFor="puc-name" required>
          <Input
            id="puc-name"
            name="name"
            defaultValue={category?.name ?? ""}
            placeholder="Contoh: Peralatan Kandang"
            autoComplete="off"
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="puc-active">Status Aktif</Label>
          <div className="flex h-9 items-center gap-2">
            <Checkbox
              id="puc-active"
              name="is_active"
              defaultChecked={category?.is_active ?? true}
            />
            <span className="text-sm text-muted">Kategori aktif digunakan</span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
