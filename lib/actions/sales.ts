"use server";

import { randomUUID } from "node:crypto";

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

const saleItemSchema = z.object({
  product_id: requiredId("Produk wajib dipilih."),
  quantity: quantityField,
  unit_price: priceField,
  livestock_ids: z.preprocess(
    (value) => (Array.isArray(value) ? value : []),
    z.array(requiredId("Referensi ternak tidak valid.")),
  ),
});

const saleSchema = z.object({
  invoice_number: z
    .string()
    .trim()
    .max(50, "Nomor invoice maksimal 50 karakter.")
    .optional()
    .transform((value) => (value ? value : null)),
  sale_date: z
    .string()
    .regex(dateRegex, "Format tanggal penjualan tidak valid (YYYY-MM-DD)."),
  customer_name: z
    .string()
    .trim()
    .min(1, "Nama customer wajib diisi.")
    .max(150, "Nama customer maksimal 150 karakter."),
  customer_phone: z
    .string()
    .trim()
    .max(30, "No. telepon maksimal 30 karakter.")
    .optional()
    .transform((value) => (value ? value : null)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

type SaleItemInput = z.infer<typeof saleItemSchema>;

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

function parseSale(formData: FormData) {
  return saleSchema.safeParse({
    invoice_number: String(formData.get("invoice_number") ?? ""),
    sale_date: String(formData.get("sale_date") ?? ""),
    customer_name: String(formData.get("customer_name") ?? ""),
    customer_phone: String(formData.get("customer_phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

function parseItems(
  formData: FormData,
): { ok: true; data: SaleItemInput[] } | { ok: false; message: string } {
  const raw = formData.get("items");
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, message: "Minimal satu item penjualan wajib diisi." };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Format item penjualan tidak valid." };
  }

  const parsed = z
    .array(saleItemSchema)
    .min(1, "Minimal satu item penjualan wajib diisi.")
    .max(100, "Maksimal 100 item per transaksi penjualan.")
    .safeParse(value);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Data item penjualan tidak valid.",
    };
  }

  return { ok: true, data: parsed.data };
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
      message: "Produk atau referensi ternak tidak ditemukan.",
    };
  }
  return { ok: false, message: `Gagal menyimpan penjualan: ${error.message}` };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function saleTotal(items: SaleItemInput[]): number {
  return roundMoney(
    items.reduce(
      (total, item) => total + item.quantity * item.unit_price,
      0,
    ),
  );
}

function generateInvoiceNumber(saleDate: string): string {
  const compactDate = saleDate.replace(/-/g, "");
  const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `INV-S-${saleDate.slice(0, 4)}-${compactDate.slice(4)}-${suffix}`;
}

function revalidateSalePages(saleId?: number) {
  revalidatePath("/sales");
  if (saleId !== undefined) {
    revalidatePath(`/sales/${saleId}`);
  }
  revalidatePath("/reports/sales");
  revalidatePath("/");
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function insertItems(
  supabase: Supabase,
  saleId: number,
  items: SaleItemInput[],
): Promise<
  | { ok: true; ids: number[] }
  | { ok: false; state: ActionState; ids: number[] }
> {
  const ids: number[] = [];

  for (const item of items) {
    const subtotal = roundMoney(item.quantity * item.unit_price);
    const { data, error } = await supabase
      .from("sale_item")
      .insert({
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, state: mapWriteError(error), ids };
    }
    ids.push(data.id);
  }

  const livestockRows = items.flatMap((item, index) =>
    item.livestock_ids.map((livestockId) => ({
      sale_item_id: ids[index],
      livestock_id: livestockId,
    })),
  );

  if (livestockRows.length > 0) {
    const { error } = await supabase
      .from("sale_item_livestock")
      .insert(livestockRows);

    if (error) {
      return { ok: false, state: mapWriteError(error), ids };
    }
  }

  return { ok: true, ids };
}

async function removeItems(supabase: Supabase, ids: number[]) {
  if (ids.length === 0) return;
  await supabase.from("sale_item").delete().in("id", ids);
}

export async function createSale(formData: FormData): Promise<ActionState> {
  const sale = parseSale(formData);
  if (!sale.success) {
    return {
      ok: false,
      message: "Periksa kembali data penjualan yang diisi.",
      fieldErrors: fieldErrors(sale.error),
    };
  }

  const items = parseItems(formData);
  if (!items.ok) {
    return { ok: false, message: items.message };
  }

  const supabase = await createClient();
  const total = saleTotal(items.data);

  const autoInvoice = sale.data.invoice_number === null;
  let invoiceNumber =
    sale.data.invoice_number ?? generateInvoiceNumber(sale.data.sale_date);
  let saleId: number | null = null;
  const maxAttempts = autoInvoice ? 5 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (autoInvoice) {
      invoiceNumber = generateInvoiceNumber(sale.data.sale_date);
    }

    const { data, error } = await supabase
      .from("sales")
      .insert({
        invoice_number: invoiceNumber,
        sale_date: sale.data.sale_date,
        customer_name: sale.data.customer_name,
        customer_phone: sale.data.customer_phone,
        notes: sale.data.notes,
        total_amount: total,
      })
      .select("id")
      .single();

    if (!error) {
      saleId = data.id;
      break;
    }

    if (error.code !== "23505" || sale.data.invoice_number !== null) {
      return mapWriteError(error);
    }
  }

  if (saleId === null) {
    return {
      ok: false,
      message:
        "Nomor invoice otomatis gagal dibuat. Silakan isi nomor invoice secara manual.",
    };
  }

  const inserted = await insertItems(supabase, saleId, items.data);
  if (!inserted.ok) {
    await supabase.from("sales").delete().eq("id", saleId);
    return inserted.state;
  }

  revalidateSalePages(saleId);
  return { ok: true };
}

export async function updateSale(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID penjualan tidak valid." };
  }

  const sale = parseSale(formData);
  if (!sale.success) {
    return {
      ok: false,
      message: "Periksa kembali data penjualan yang diisi.",
      fieldErrors: fieldErrors(sale.error),
    };
  }

  const items = parseItems(formData);
  if (!items.ok) {
    return { ok: false, message: items.message };
  }

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("sales")
    .select("id, invoice_number")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      message: `Gagal memuat penjualan: ${existingError.message}`,
    };
  }
  if (!existing) {
    return { ok: false, message: "Penjualan tidak ditemukan." };
  }

  const invoiceNumber =
    sale.data.invoice_number ?? existing.invoice_number;

  const { error: headerError } = await supabase
    .from("sales")
    .update({
      invoice_number: invoiceNumber,
      sale_date: sale.data.sale_date,
      customer_name: sale.data.customer_name,
      customer_phone: sale.data.customer_phone,
      notes: sale.data.notes,
    })
    .eq("id", id);

  if (headerError) return mapWriteError(headerError);

  const { data: oldItems, error: oldItemsError } = await supabase
    .from("sale_item")
    .select("id")
    .eq("sale_id", id);

  if (oldItemsError) {
    return {
      ok: false,
      message: `Gagal memuat item penjualan: ${oldItemsError.message}`,
    };
  }

  const inserted = await insertItems(supabase, id, items.data);
  if (!inserted.ok) {
    await removeItems(supabase, inserted.ids);
    return inserted.state;
  }

  const keep = new Set(inserted.ids);
  const staleIds = (oldItems ?? [])
    .map((row) => row.id)
    .filter((oldId) => !keep.has(oldId));

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("sale_item")
      .delete()
      .in("id", staleIds);

    if (deleteError) {
      await removeItems(supabase, inserted.ids);
      return {
        ok: false,
        message: `Gagal memperbarui item penjualan: ${deleteError.message}`,
      };
    }
  }

  const { error: totalError } = await supabase
    .from("sales")
    .update({ total_amount: saleTotal(items.data) })
    .eq("id", id);

  if (totalError) {
    return {
      ok: false,
      message: `Gagal memperbarui total penjualan: ${totalError.message}`,
    };
  }

  revalidateSalePages(id);
  return { ok: true };
}

export async function deleteSale(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { ok: false, message: "ID penjualan tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("id", id);

  if (error) {
    return { ok: false, message: `Gagal menghapus penjualan: ${error.message}` };
  }

  revalidateSalePages(id);
  return { ok: true };
}
