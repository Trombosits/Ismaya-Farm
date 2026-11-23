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
  createPurchaseCategory,
  updatePurchaseCategory,
} from "@/lib/actions/purchase-categories";
import type { ActionState } from "@/lib/actions/types";
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
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "purchase-category-form";
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && category
          ? await updatePurchaseCategory(Number(category.id), formData)
          : await createPurchaseCategory(formData);

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
      title={isEdit ? "Edit Kategori Pembelian" : "Tambah Kategori Pembelian"}
      description={
        isEdit
          ? "Perbarui informasi kategori pembelian."
          : "Lengkapi data untuk menambahkan kategori pembelian baru."
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
          htmlFor="puc-name"
          required
          error={fieldErrors?.name}
        >
          <Input
            id="puc-name"
            name="name"
            defaultValue={category?.name ?? ""}
            placeholder="Contoh: Peralatan Kandang"
            autoComplete="off"
            disabled={pending}
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="puc-active">Status Aktif</Label>
          <div className="flex h-9 items-center gap-2">
            <Checkbox
              id="puc-active"
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
