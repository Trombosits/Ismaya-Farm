"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const activeField = z.preprocess(
  (value) =>
    value === "on" || value === "true" || value === "1" || value === true,
  z.boolean(),
);

const purchaseCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(100, "Nama kategori maksimal 100 karakter."),
  is_active: activeField,
});

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

function parse(formData: FormData) {
  return purchaseCategorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    is_active: formData.get("is_active"),
  });
}

function mapWriteError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") {
    return {
      ok: false,
      message: "Nama kategori pembelian sudah digunakan.",
      fieldErrors: { name: "Nama kategori pembelian sudah digunakan." },
    };
  }
  return {
    ok: false,
    message: `Gagal menyimpan kategori pembelian: ${error.message}`,
  };
}

function revalidatePurchaseCategoryPages() {
  revalidatePath("/purchases/categories");
  revalidatePath("/purchases");
  revalidatePath("/reports/purchases");
  revalidatePath("/");
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export async function createPurchaseCategory(
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data kategori pembelian yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("purchase_categories").insert({
    name: parsed.data.name,
    is_active: parsed.data.is_active,
  });

  if (error) return mapWriteError(error);

  revalidatePurchaseCategoryPages();
  return { ok: true };
}

export async function updatePurchaseCategory(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID kategori pembelian tidak valid." };
  }

  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data kategori pembelian yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_categories")
    .update({
      name: parsed.data.name,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidatePurchaseCategoryPages();
  return { ok: true };
}

export async function deletePurchaseCategory(
  id: number,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID kategori pembelian tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_categories")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Kategori pembelian tidak dapat dihapus karena masih digunakan oleh transaksi pembelian.",
      };
    }
    return {
      ok: false,
      message: `Gagal menghapus kategori pembelian: ${error.message}`,
    };
  }

  revalidatePurchaseCategoryPages();
  return { ok: true };
}
