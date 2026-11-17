"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProductCategory,
  updateProductCategory,
} from "@/lib/actions/product-categories";
import type { ActionState } from "@/lib/actions/types";
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
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "product-category-form";
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && category
          ? await updateProductCategory(Number(category.id), formData)
          : await createProductCategory(formData);

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
      title={isEdit ? "Edit Kategori Produk" : "Tambah Kategori Produk"}
      description={
        isEdit
          ? "Perbarui informasi kategori produk."
          : "Lengkapi data untuk menambahkan kategori produk baru."
      }
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

        <Field
          label="Nama"
          htmlFor="pc-name"
          required
          error={fieldErrors?.name}
        >
          <Input
            id="pc-name"
            name="name"
            defaultValue={category?.name ?? ""}
            placeholder="Contoh: Telur"
            autoComplete="off"
            disabled={pending}
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pc-active">Status Aktif</Label>
          <div className="flex h-9 items-center gap-2">
            <Checkbox
              id="pc-active"
              name="is_active"
              defaultChecked={category?.is_active ?? true}
              disabled={pending}
            />
            <span className="text-sm text-muted">Kategori aktif digunakan</span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
