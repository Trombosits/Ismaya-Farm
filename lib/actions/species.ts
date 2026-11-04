"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./types";

const speciesSchema = z.object({
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
  return speciesSchema.safeParse({
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
      message: "Kode jenis ternak sudah digunakan.",
      fieldErrors: { code: "Kode sudah digunakan." },
    };
  }
  if (error.code === "23503") {
    return { ok: false, message: "Data terkait tidak ditemukan." };
  }
  return { ok: false, message: `Gagal menyimpan data: ${error.message}` };
}

export async function createSpecies(formData: FormData): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data yang diisi.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("livestock_species").insert({
    name: parsed.data.name,
    code: parsed.data.code,
  });

  if (error) return mapWriteError(error);

  revalidatePath("/livestock/species");
  revalidatePath("/livestock/breeds");
  return { ok: true };
}

export async function updateSpecies(
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
    .from("livestock_species")
    .update({ name: parsed.data.name, code: parsed.data.code })
    .eq("id", id);

  if (error) return mapWriteError(error);

  revalidatePath("/livestock/species");
  revalidatePath("/livestock/breeds");
  return { ok: true };
}

export async function deleteSpecies(id: number): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("livestock_species")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Jenis ternak tidak dapat dihapus karena masih digunakan oleh ras atau data ternak.",
      };
    }
    return { ok: false, message: `Gagal menghapus data: ${error.message}` };
  }

  revalidatePath("/livestock/species");
  revalidatePath("/livestock/breeds");
  return { ok: true };
}
