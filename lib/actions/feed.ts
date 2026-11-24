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

const optionalId = () =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    },
    z.number().int().positive().nullable(),
  );

const quantityField = z.preprocess(
  (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  z.number().positive("Quantity harus lebih dari 0."),
);

const priceField = z.preprocess(
  (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  z.number().min(0, "Harga satuan tidak boleh negatif."),
);

const nonNegativeField = z.preprocess(
  (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  z.number().min(0, "Nilai tidak boleh negatif."),
);

const activeField = z.preprocess(
  (value) => value === "on" || value === "true" || value === "1" || value === true,
  z.boolean(),
);

const feedTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama pakan wajib diisi.")
    .max(120, "Nama pakan maksimal 120 karakter."),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi.")
    .max(20, "Satuan maksimal 20 karakter."),
  minimum_stock: nonNegativeField,
  is_active: activeField,
});

const feedPurchaseItemSchema = z.object({
  feed_type_id: requiredId("Jenis pakan wajib dipilih."),
  quantity: quantityField,
  unit_price: priceField,
});

const feedPurchaseSchema = z.object({
  purchase_date: z
    .string()
    .regex(dateRegex, "Format tanggal pembelian tidak valid (YYYY-MM-DD)."),
  supplier: z
    .string()
    .trim()
    .min(1, "Nama supplier wajib diisi.")
    .max(150, "Nama supplier maksimal 150 karakter."),
  invoice_number: z
    .string()
    .trim()
    .max(50, "Nomor invoice maksimal 50 karakter.")
    .optional()
    .transform((value) => (value ? value : null)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

const inventoryTransactionSchema = z.object({
  feed_type_id: requiredId("Jenis pakan wajib dipilih."),
  transaction_type: z.enum(["in", "out"], {
    message: "Tipe transaksi tidak valid.",
  }),
  transaction_date: z
    .string()
    .regex(dateRegex, "Format tanggal transaksi tidak valid (YYYY-MM-DD)."),
  quantity: quantityField,
  unit_price: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }),
  reference_type: z.enum(["feed_purchase", "feed_usage"], {
    message: "Reference type tidak valid.",
  }),
  reference_id: optionalId(),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

type FeedPurchaseItemInput = z.infer<typeof feedPurchaseItemSchema>;

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

function mapWriteError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") {
    return {
      ok: false,
      message: "Nomor invoice sudah digunakan.",
      fieldErrors: { invoice_number: "Nomor invoice sudah digunakan." },
    };
  }
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Data referensi (jenis pakan) tidak ditemukan.",
    };
  }
  return { ok: false, message: `Gagal menyimpan data pakan: ${error.message}` };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function revalidateFeedPages() {
  revalidatePath("/feed/types");
  revalidatePath("/feed/purchases");
  revalidatePath("/feed/inventory");
  revalidatePath("/reports/feed-stock");
  revalidatePath("/reports/feed-usage");
  revalidatePath("/reports/feed-purchases");
  revalidatePath("/");
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

/* ------------------------------------------------------------------ */
/* Jenis pakan                                                         */
/* ------------------------------------------------------------------ */

export async function createFeedType(formData: FormData): Promise<ActionState> {
  const parsed = feedTypeSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    minimum_stock: formData.get("minimum_stock"),
    is_active: formData.get("is_active"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data jenis pakan yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feed_types").insert(parsed.data);

  if (error) return mapWriteError(error);

  revalidateFeedPages();
  return { ok: true };
}

export async function updateFeedType(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID jenis pakan tidak valid." };
  }

  const parsed = feedTypeSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    minimum_stock: formData.get("minimum_stock"),
    is_active: formData.get("is_active"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data jenis pakan yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("feed_types")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidateFeedPages();
  return { ok: true };
}

export async function deleteFeedType(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID jenis pakan tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feed_types").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Jenis pakan tidak dapat dihapus karena masih dipakai oleh pembelian atau transaksi stok.",
      };
    }
    return {
      ok: false,
      message: `Gagal menghapus jenis pakan: ${error.message}`,
    };
  }

  revalidateFeedPages();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Pembelian pakan                                                     */
/* ------------------------------------------------------------------ */

function parseFeedPurchase(formData: FormData) {
  return feedPurchaseSchema.safeParse({
    purchase_date: String(formData.get("purchase_date") ?? ""),
    supplier: String(formData.get("supplier") ?? ""),
    invoice_number: String(formData.get("invoice_number") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

function parseFeedPurchaseItems(
  formData: FormData,
):
  | { ok: true; data: FeedPurchaseItemInput[] }
  | { ok: false; message: string } {
  const raw = formData.get("items");
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, message: "Minimal satu item pakan wajib diisi." };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Format item pembelian tidak valid." };
  }

  const parsed = z
    .array(feedPurchaseItemSchema)
    .min(1, "Minimal satu item pakan wajib diisi.")
    .max(100, "Maksimal 100 item per pembelian.")
    .safeParse(value);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Data item pakan tidak valid.",
    };
  }

  return { ok: true, data: parsed.data };
}

async function insertFeedPurchaseItems(
  supabase: Supabase,
  purchaseId: number,
  items: FeedPurchaseItemInput[],
): Promise<{ ok: true; ids: number[] } | { ok: false; state: ActionState }> {
  const rows = items.map((item) => ({
    purchase_id: purchaseId,
    feed_type_id: item.feed_type_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: roundMoney(item.quantity * item.unit_price),
  }));

  const { data, error } = await supabase
    .from("feed_purchases_items")
    .insert(rows)
    .select("id");

  if (error) return { ok: false, state: mapWriteError(error) };

  return { ok: true, ids: (data ?? []).map((row) => row.id) };
}

/** Setiap item pembelian otomatis menjadi transaksi stok masuk. */
async function syncPurchaseStock(
  supabase: Supabase,
  purchaseId: number,
  purchaseDate: string,
  items: FeedPurchaseItemInput[],
): Promise<ActionState | null> {
  const { error: deleteError } = await supabase
    .from("feed_inventory_transactions")
    .delete()
    .eq("reference_type", "feed_purchase")
    .eq("reference_id", purchaseId);

  if (deleteError) {
    return {
      ok: false,
      message: `Gagal menyinkronkan transaksi stok: ${deleteError.message}`,
    };
  }

  const rows = items.map((item) => ({
    feed_type_id: item.feed_type_id,
    transaction_type: "in" as const,
    quantity: item.quantity,
    unit_price: item.unit_price,
    transaction_date: purchaseDate,
    reference_type: "feed_purchase" as const,
    reference_id: purchaseId,
    notes: null,
  }));

  const { error } = await supabase
    .from("feed_inventory_transactions")
    .insert(rows);

  if (error) {
    return {
      ok: false,
      message: `Gagal mencatat transaksi stok: ${error.message}`,
    };
  }

  return null;
}

export async function createFeedPurchase(
  formData: FormData,
): Promise<ActionState> {
  const purchase = parseFeedPurchase(formData);
  if (!purchase.success) {
    return {
      ok: false,
      message: "Periksa kembali data pembelian pakan yang diisi.",
      fieldErrors: fieldErrors(purchase.error),
    };
  }

  const items = parseFeedPurchaseItems(formData);
  if (!items.ok) return { ok: false, message: items.message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_purchases")
    .insert({
      purchase_date: purchase.data.purchase_date,
      supplier: purchase.data.supplier,
      invoice_number: purchase.data.invoice_number,
      notes: purchase.data.notes,
    })
    .select("id")
    .single();

  if (error) return mapWriteError(error);

  const inserted = await insertFeedPurchaseItems(supabase, data.id, items.data);
  if (!inserted.ok) {
    await supabase.from("feed_purchases").delete().eq("id", data.id);
    return inserted.state;
  }

  const stockError = await syncPurchaseStock(
    supabase,
    data.id,
    purchase.data.purchase_date,
    items.data,
  );
  if (stockError) return stockError;

  revalidateFeedPages();
  return { ok: true };
}

export async function updateFeedPurchase(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID pembelian pakan tidak valid." };
  }

  const purchase = parseFeedPurchase(formData);
  if (!purchase.success) {
    return {
      ok: false,
      message: "Periksa kembali data pembelian pakan yang diisi.",
      fieldErrors: fieldErrors(purchase.error),
    };
  }

  const items = parseFeedPurchaseItems(formData);
  if (!items.ok) return { ok: false, message: items.message };

  const supabase = await createClient();

  const { data: oldItems, error: oldItemsError } = await supabase
    .from("feed_purchases_items")
    .select("id")
    .eq("purchase_id", id);

  if (oldItemsError) {
    return {
      ok: false,
      message: `Gagal memuat item pembelian pakan: ${oldItemsError.message}`,
    };
  }

  const { error: headerError } = await supabase
    .from("feed_purchases")
    .update({
      purchase_date: purchase.data.purchase_date,
      supplier: purchase.data.supplier,
      invoice_number: purchase.data.invoice_number,
      notes: purchase.data.notes,
    })
    .eq("id", id);

  if (headerError) return mapWriteError(headerError);

  const inserted = await insertFeedPurchaseItems(supabase, id, items.data);
  if (!inserted.ok) return inserted.state;

  const keep = new Set(inserted.ids);
  const staleIds = (oldItems ?? [])
    .map((row) => row.id)
    .filter((oldId) => !keep.has(oldId));

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("feed_purchases_items")
      .delete()
      .in("id", staleIds);

    if (deleteError) {
      return {
        ok: false,
        message: `Gagal memperbarui item pembelian pakan: ${deleteError.message}`,
      };
    }
  }

  const stockError = await syncPurchaseStock(
    supabase,
    id,
    purchase.data.purchase_date,
    items.data,
  );
  if (stockError) return stockError;

  revalidateFeedPages();
  return { ok: true };
}

export async function deleteFeedPurchase(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID pembelian pakan tidak valid." };
  }

  const supabase = await createClient();

  const { error: stockError } = await supabase
    .from("feed_inventory_transactions")
    .delete()
    .eq("reference_type", "feed_purchase")
    .eq("reference_id", id);

  if (stockError) {
    return {
      ok: false,
      message: `Gagal menghapus transaksi stok terkait: ${stockError.message}`,
    };
  }

  const { error } = await supabase.from("feed_purchases").delete().eq("id", id);

  if (error) {
    return {
      ok: false,
      message: `Gagal menghapus pembelian pakan: ${error.message}`,
    };
  }

  revalidateFeedPages();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Transaksi stok                                                      */
/* ------------------------------------------------------------------ */

function parseInventoryTransaction(formData: FormData) {
  const referenceType = String(formData.get("reference_type") ?? "");
  return inventoryTransactionSchema.safeParse({
    feed_type_id: formData.get("feed_type_id"),
    transaction_type: String(formData.get("transaction_type") ?? ""),
    transaction_date: String(formData.get("transaction_date") ?? ""),
    quantity: formData.get("quantity"),
    unit_price: String(formData.get("unit_price") ?? ""),
    reference_type: referenceType,
    reference_id:
      referenceType === "feed_purchase" ? formData.get("reference_id") : null,
    notes: String(formData.get("notes") ?? ""),
  });
}

export async function createInventoryTransaction(
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseInventoryTransaction(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data transaksi stok yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("feed_inventory_transactions")
    .insert(parsed.data);

  if (error) return mapWriteError(error);

  revalidateFeedPages();
  return { ok: true };
}

export async function updateInventoryTransaction(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID transaksi stok tidak valid." };
  }

  const parsed = parseInventoryTransaction(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data transaksi stok yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("feed_inventory_transactions")
    .update(parsed.data)
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidateFeedPages();
  return { ok: true };
}

export async function deleteInventoryTransaction(
  id: number,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID transaksi stok tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("feed_inventory_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      message: `Gagal menghapus transaksi stok: ${error.message}`,
    };
  }

  revalidateFeedPages();
  return { ok: true };
}
