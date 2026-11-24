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
import { createFeedType, updateFeedType } from "@/lib/actions/feed";
import type { ActionState } from "@/lib/actions/types";
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
  const router = useRouter();
  const isEdit = mode === "edit";
  const formId = "feed-type-form";
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState(null);

    startTransition(async () => {
      const result =
        isEdit && feedType
          ? await updateFeedType(Number(feedType.id), formData)
          : await createFeedType(formData);

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
      title={isEdit ? "Edit Jenis Pakan" : "Tambah Jenis Pakan"}
      description={
        isEdit
          ? "Perbarui informasi jenis pakan."
          : "Lengkapi data untuk menambahkan jenis pakan baru."
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

        <FormSection title="Informasi Pakan">
          <Field
            label="Nama"
            htmlFor="ft-name"
            required
            error={fieldErrors?.name}
          >
            <Input
              id="ft-name"
              name="name"
              defaultValue={feedType?.name ?? ""}
              placeholder="Contoh: Konsentrat Sapi"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="Satuan"
            htmlFor="ft-unit"
            required
            error={fieldErrors?.unit}
            hint="Contoh: kg, sak, karung."
          >
            <Input
              id="ft-unit"
              name="unit"
              defaultValue={feedType?.unit ?? ""}
              placeholder="kg"
              autoComplete="off"
              disabled={pending}
            />
          </Field>
          <Field
            label="Minimum Stok"
            htmlFor="ft-min"
            required
            error={fieldErrors?.minimum_stock}
          >
            <Input
              id="ft-min"
              name="minimum_stock"
              type="number"
              min={0}
              step="any"
              defaultValue={feedType?.minimum_stock ?? 0}
              disabled={pending}
            />
          </Field>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ft-active">Status Aktif</Label>
            <div className="flex h-9 items-center gap-2">
              <Checkbox
                id="ft-active"
                name="is_active"
                defaultChecked={feedType?.is_active ?? true}
                disabled={pending}
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
