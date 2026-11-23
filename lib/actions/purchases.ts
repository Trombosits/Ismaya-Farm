"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

type Supabase = Awaited<ReturnType<typeof createClient>>;

const requiredId = (message: string) =>
  z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    z.number().int().positive(message),
  );

const quantityField = z.preprocess(
  (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  z.number().positive("Jumlah item harus lebih dari 0."),
);

const priceField = z.preprocess(
  (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  z.number().min(0, "Harga satuan tidak boleh negatif."),
);

const purchaseItemSchema = z.object({
  item_name: z
    .string()
    .trim()
    .min(1, "Nama item wajib diisi.")
    .max(150, "Nama item maksimal 150 karakter."),
  quantity: quantityField,
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(20, "Satuan maksimal 20 karakter."),
  unit_price: priceField,
});

const purchaseSchema = z.object({
  purchase_date: z
    .string()
    .regex(dateRegex, "Format tanggal pembelian tidak valid (YYYY-MM-DD)."),
  supplier: z
    .string()
    .trim()
    .min(1, "Nama supplier wajib diisi.")
    .max(150, "Nama supplier maksimal 150 karakter."),
  category_id: requiredId("Kategori pembelian wajib dipilih."),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;

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

function parsePurchase(formData: FormData) {
  return purchaseSchema.safeParse({
    purchase_date: String(formData.get("purchase_date") ?? ""),
    supplier: String(formData.get("supplier") ?? ""),
    category_id: formData.get("category_id"),
    notes: String(formData.get("notes") ?? ""),
  });
}

function parseItems(
  formData: FormData,
): { ok: true; data: PurchaseItemInput[] } | { ok: false; message: string } {
  const raw = formData.get("items");
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, message: "Minimal satu item pembelian wajib diisi." };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Format item pembelian tidak valid." };
  }

  const parsed = z
    .array(purchaseItemSchema)
    .min(1, "Minimal satu item pembelian wajib diisi.")
    .max(100, "Maksimal 100 item per transaksi pembelian.")
    .safeParse(value);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Data item pembelian tidak valid.",
    };
  }

  return { ok: true, data: parsed.data };
}

function mapWriteError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Kategori pembelian tidak ditemukan.",
    };
  }
  return { ok: false, message: `Gagal menyimpan pembelian: ${error.message}` };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function purchaseTotal(items: PurchaseItemInput[]): number {
  return roundMoney(
    items.reduce(
      (total, item) => total + item.quantity * item.unit_price,
      0,
    ),
  );
}

function revalidatePurchasePages(purchaseId?: number) {
  revalidatePath("/purchases");
  if (purchaseId !== undefined) {
    revalidatePath(`/purchases/${purchaseId}`);
  }
  revalidatePath("/purchases/categories");
  revalidatePath("/reports/purchases");
  revalidatePath("/");
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function insertItems(
  supabase: Supabase,
  purchaseId: number,
  items: PurchaseItemInput[],
): Promise<{ ok: true; ids: number[] } | { ok: false; state: ActionState }> {
  const rows = items.map((item) => ({
    purchase_id: purchaseId,
    item_name: item.item_name,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    subtotal: roundMoney(item.quantity * item.unit_price),
  }));

  const { data, error } = await supabase
    .from("purchase_item")
    .insert(rows)
    .select("id");

  if (error) {
    return { ok: false, state: mapWriteError(error) };
  }

  return { ok: true, ids: (data ?? []).map((row) => row.id) };
}

export async function createPurchase(
  formData: FormData,
): Promise<ActionState> {
  const purchase = parsePurchase(formData);
  if (!purchase.success) {
    return {
      ok: false,
      message: "Periksa kembali data pembelian yang diisi.",
      fieldErrors: fieldErrors(purchase.error),
    };
  }

  const items = parseItems(formData);
  if (!items.ok) {
    return { ok: false, message: items.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .insert({
      purchase_date: purchase.data.purchase_date,
      supplier: purchase.data.supplier,
      category_id: purchase.data.category_id,
      total_amount: purchaseTotal(items.data),
      notes: purchase.data.notes,
    })
    .select("id")
    .single();

  if (error) return mapWriteError(error);

  const inserted = await insertItems(supabase, data.id, items.data);
  if (!inserted.ok) {
    await supabase.from("purchases").delete().eq("id", data.id);
    return inserted.state;
  }

  revalidatePurchasePages(data.id);
  return { ok: true };
}

export async function updatePurchase(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID pembelian tidak valid." };
  }

  const purchase = parsePurchase(formData);
  if (!purchase.success) {
    return {
      ok: false,
      message: "Periksa kembali data pembelian yang diisi.",
      fieldErrors: fieldErrors(purchase.error),
    };
  }

  const items = parseItems(formData);
  if (!items.ok) {
    return { ok: false, message: items.message };
  }

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("purchases")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      message: `Gagal memuat pembelian: ${existingError.message}`,
    };
  }
  if (!existing) {
    return { ok: false, message: "Pembelian tidak ditemukan." };
  }

  const { data: oldItems, error: oldItemsError } = await supabase
    .from("purchase_item")
    .select("id")
    .eq("purchase_id", id);

  if (oldItemsError) {
    return {
      ok: false,
      message: `Gagal memuat item pembelian: ${oldItemsError.message}`,
    };
  }

  const { error: headerError } = await supabase
    .from("purchases")
    .update({
      purchase_date: purchase.data.purchase_date,
      supplier: purchase.data.supplier,
      category_id: purchase.data.category_id,
      notes: purchase.data.notes,
    })
    .eq("id", id);

  if (headerError) return mapWriteError(headerError);

  const inserted = await insertItems(supabase, id, items.data);
  if (!inserted.ok) {
    return inserted.state;
  }

  const keep = new Set(inserted.ids);
  const staleIds = (oldItems ?? [])
    .map((row) => row.id)
    .filter((oldId) => !keep.has(oldId));

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("purchase_item")
      .delete()
      .in("id", staleIds);

    if (deleteError) {
      return {
        ok: false,
        message: `Gagal memperbarui item pembelian: ${deleteError.message}`,
      };
    }
  }

  const { error: totalError } = await supabase
    .from("purchases")
    .update({ total_amount: purchaseTotal(items.data) })
    .eq("id", id);

  if (totalError) {
    return {
      ok: false,
      message: `Gagal memperbarui total pembelian: ${totalError.message}`,
    };
  }

  revalidatePurchasePages(id);
  return { ok: true };
}

export async function deletePurchase(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID pembelian tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("purchases").delete().eq("id", id);

  if (error) {
    return {
      ok: false,
      message: `Gagal menghapus pembelian: ${error.message}`,
    };
  }

  revalidatePurchasePages(id);
  return { ok: true };
}
