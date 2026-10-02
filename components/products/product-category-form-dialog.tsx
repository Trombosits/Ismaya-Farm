"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductCategory } from "@/lib/products";

interface ProductCategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  category?: ProductCategory | null;
}

export function ProductCategoryFormDialog({
  open,
  onClose,
  mode,
  category,
}: ProductCategoryFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "product-category-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kategori Produk" : "Tambah Kategori Produk"}
      description={
        isEdit
          ? "Perbarui informasi kategori produk."
          : "Lengkapi data untuk menambahkan kategori produk baru."
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
        <Field label="Nama" htmlFor="pc-name" required>
          <Input
            id="pc-name"
            name="name"
            defaultValue={category?.name ?? ""}
            placeholder="Contoh: Telur"
            autoComplete="off"
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pc-active">Status Aktif</Label>
          <div className="flex h-9 items-center gap-2">
            <Checkbox
              id="pc-active"
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
