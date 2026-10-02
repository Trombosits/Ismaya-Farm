"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { productCategories, type Product } from "@/lib/products";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  product?: Product | null;
}

export function ProductFormDialog({
  open,
  onClose,
  mode,
  product,
}: ProductFormDialogProps) {
  const isEdit = mode === "edit";
  const formId = "product-form";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Produk" : "Tambah Produk"}
      description={
        isEdit
          ? "Perbarui informasi produk."
          : "Lengkapi data untuk menambahkan produk baru."
      }
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
        className="flex flex-col gap-4"
      >
        <FormSection title="Informasi Produk">
          <Field label="Kategori" htmlFor="pr-category" required>
            <Select
              id="pr-category"
              name="category_id"
              defaultValue={product?.category_id ?? ""}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {productCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nama Produk" htmlFor="pr-name" required>
            <Input
              id="pr-name"
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="Contoh: Telur Ayam"
              autoComplete="off"
            />
          </Field>
          <Field label="SKU" htmlFor="pr-sku" required>
            <Input
              id="pr-sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="Contoh: EGG-001"
              autoComplete="off"
              className="font-mono uppercase"
            />
          </Field>
          <Field
            label="Satuan"
            htmlFor="pr-unit"
            required
            hint="Contoh: kg, ekor, liter, karung."
          >
            <Input
              id="pr-unit"
              name="unit"
              defaultValue={product?.unit ?? ""}
              placeholder="kg"
              autoComplete="off"
            />
          </Field>
          <Field label="Harga Jual" htmlFor="pr-price" required>
            <Input
              id="pr-price"
              name="selling_price"
              type="number"
              min={0}
              defaultValue={product?.selling_price ?? 0}
            />
          </Field>
        </FormSection>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pr-active">Status Aktif</Label>
          <div className="flex h-9 items-center gap-2">
            <Checkbox
              id="pr-active"
              name="is_active"
              defaultChecked={product?.is_active ?? true}
            />
            <span className="text-sm text-muted">Produk aktif dijual</span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
