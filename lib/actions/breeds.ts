"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const breedSchema = z.object({
  species_id: z.coerce
    .number()
    .int()
    .positive("Jenis ternak wajib dipilih."),
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(100, "Nama maksimal 100 karakter."),
  code: z
    .string()
    .trim()
    .min(1, "Kode wajib diisi.")
    .max(20, "Kode maksimal 20 karakter.")
    .regex(/^[A-Za-z0-9-]+$/, "Kode hanya boleh huruf, angka, dan tanda hubung.")
    .transform((value) => value.toUpperCase()),
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
  return breedSchema.safeParse({
    species_id: formData.get("species_id"),
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
  });
}

function mapWriteError(error: {
  code?: string;
  message: string;
}): ActionState {
  if (error.code === "23505") {
    return {
      ok: false,
      message: "Kode ras sudah digunakan untuk jenis ternak ini.",
      fieldErrors: { code: "Kode ras sudah digunakan untuk jenis ternak ini." },
    };
  }
  if (error.code === "23503") {
    return {
      ok: false,
      message: "Jenis ternak tidak ditemukan.",
      fieldErrors: { species_id: "Jenis ternak tidak ditemukan." },
    };
  }
  return { ok: false, message: `Gagal menyimpan data: ${error.message}` };
}

export async function createBreed(formData: FormData): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("livestock_breeds").insert({
    species_id: parsed.data.species_id,
    name: parsed.data.name,
    code: parsed.data.code,
  });

  if (error) return mapWriteError(error);

  revalidatePath("/livestock/breeds");
  return { ok: true };
}

export async function updateBreed(
  id: number,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("livestock_breeds")
    .update({
      species_id: parsed.data.species_id,
      name: parsed.data.name,
      code: parsed.data.code,
    })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock/breeds");
  return { ok: true };
}

export async function deleteBreed(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("livestock_breeds")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Ras ternak tidak dapat dihapus karena masih digunakan oleh data ternak.",
      };
    }
    return { ok: false, message: `Gagal menghapus data: ${error.message}` };
  }

  revalidatePath("/livestock/breeds");
  return { ok: true };
}
