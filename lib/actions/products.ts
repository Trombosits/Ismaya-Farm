"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const requiredId = (message: string) =>
  z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z.number().int().positive(message),
  );

const moneyField = (message: string) =>
  z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z.number().min(0, message),
  );

const activeField = z.preprocess(
  (value) =>
    value === "on" || value === "true" || value === "1" || value === true,
  z.boolean(),
);

const productSchema = z.object({
  category_id: requiredId("Kategori produk wajib dipilih."),
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(150, "Nama produk maksimal 150 karakter."),
  sku: z
    .string()
    .trim()
    .min(1, "SKU wajib diisi.")
    .max(50, "SKU maksimal 50 karakter.")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "SKU hanya boleh huruf, angka, dan tanda hubung.",
    )
    .transform((value) => value.toUpperCase()),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(20, "Satuan maksimal 20 karakter."),
  selling_price: moneyField("Harga jual tidak boleh negatif."),
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
  return productSchema.safeParse({
    category_id: formData.get("category_id"),
    name: String(formData.get("name") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    selling_price: formData.get("selling_price"),
    is_active: formData.get("is_active"),
  });
}

function mapWriteError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") {
    return {
      ok: false,
      message: "SKU produk sudah digunakan.",
      fieldErrors: { sku: "SKU produk sudah digunakan." },
    };
  }
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Kategori produk tidak ditemukan.",
      fieldErrors: { category_id: "Kategori produk tidak ditemukan." },
    };
  }
  return { ok: false, message: `Gagal menyimpan produk: ${error.message}` };
}

function revalidateProductPages() {
  revalidatePath("/products");
  revalidatePath("/products/categories");
  revalidatePath("/sales");
  revalidatePath("/sales", "layout");
  revalidatePath("/reports/sales");
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export async function createProduct(
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data produk yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(parsed.data);

  if (error) return mapWriteError(error);

  revalidateProductPages();
  return { ok: true };
}

export async function updateProduct(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID produk tidak valid." };
  }

  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data produk yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidateProductPages();
  return { ok: true };
}

export async function deleteProduct(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID produk tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Produk tidak dapat dihapus karena masih digunakan pada transaksi penjualan.",
      };
    }
    return { ok: false, message: `Gagal menghapus produk: ${error.message}` };
  }

  revalidateProductPages();
  return { ok: true };
}
