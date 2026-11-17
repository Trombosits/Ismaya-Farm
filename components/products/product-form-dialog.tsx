"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { ActionState } from "@/lib/actions/types";
import type { Product, ProductCategory } from "@/lib/products";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  product?: Product | null;
  categories: ProductCategory[];
}

export function ProductFormDialog({
  open,
  onClose,
  mode,
  product,
  categories,
}: ProductFormDialogProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "product-form";
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && product
          ? await updateProduct(Number(product.id), formData)
          : await createProduct(formData);

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
      title={isEdit ? "Edit Produk" : "Tambah Produk"}
      description={
        isEdit
          ? "Perbarui informasi produk."
          : "Lengkapi data untuk menambahkan produk baru."
      }
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
        className="flex flex-col gap-4"
      >
        {generalError ? (
          <p
            role="alert"
            className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger"
          >
            {generalError}
          </p>
        ) : null}

        <FormSection title="Informasi Produk">
          <Field
            label="Kategori"
            htmlFor="pr-category"
            required
            error={fieldErrors?.category_id}
          >
            <Select
              id="pr-category"
              name="category_id"
              defaultValue={product?.category_id ?? ""}
              disabled={pending}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Nama Produk"
            htmlFor="pr-name"
            required
            error={fieldErrors?.name}
          >
            <Input
              id="pr-name"
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="Contoh: Telur Ayam"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="SKU"
            htmlFor="pr-sku"
            required
            error={fieldErrors?.sku}
          >
            <Input
              id="pr-sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="Contoh: EGG-001"
              autoComplete="off"
              className="font-mono uppercase"
              disabled={pending}
            />
          </Field>
          <Field
            label="Satuan"
            htmlFor="pr-unit"
            required
            error={fieldErrors?.unit}
            hint="Contoh: kg, ekor, liter, karung."
          >
            <Input
              id="pr-unit"
              name="unit"
              defaultValue={product?.unit ?? ""}
              placeholder="kg"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="Harga Jual"
            htmlFor="pr-price"
            required
            error={fieldErrors?.selling_price}
          >
            <Input
              id="pr-price"
              name="selling_price"
              type="number"
              min={0}
              defaultValue={product?.selling_price ?? 0}
              disabled={pending}
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
              disabled={pending}
            />
            <span className="text-sm text-muted">Produk aktif dijual</span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
