"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HatcheryBatch } from "@/lib/hatchery";

type HatcheryBatchStatus = "incubating" | "hatched" | "failed";

function isHatcheryBatchStatus(
  status: string | null,
): status is HatcheryBatchStatus {
  return (
    status !== null && ["incubating", "hatched", "failed"].includes(status)
  );
}

const PATH = "/hatchery/batches";

export async function getHatcheryBatches() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_batches")
    .select(
      `
      id,
      batch_code,
      species_id,
      start_date,
      egg_quantity,
      expected_hatch_date,
      status,
      notes,
      created_at,
      updated_at
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false as const,
      message: error.message,
      data: [],
    };
  }

  const invalidStatus = data?.find(
    (batch) => !isHatcheryBatchStatus(batch.status),
  );

  if (invalidStatus) {
    return {
      success: false as const,
      message: `Status batch "${invalidStatus.batch_code}" tidak valid: ${invalidStatus.status}`,
      data: [],
    };
  }

  const batches: HatcheryBatch[] = (data ?? []).map((batch) => ({
    ...batch,
    status: batch.status as HatcheryBatchStatus,
  }));

  return {
    success: true as const,
    message: "Berhasil",
    data: batches,
  };
}

export async function getSpeciesOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("livestock_species")
    .select("id, name")
    .order("name");

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, message: "Berhasil", data };
}

export async function createHatcheryBatch(formData: FormData) {
  const supabase = await createClient();

  const batch_code = String(formData.get("batch_code") || "").trim();
  const species_id = Number(formData.get("species_id"));
  const start_date = String(formData.get("start_date") || "");
  const egg_quantity = Number(formData.get("egg_quantity"));
  const expected = String(formData.get("expected_hatch_date") || "");
  const status = String(formData.get("status") || "incubating");
  const notes = String(formData.get("notes") || "").trim();

  if (
    !batch_code ||
    !Number.isInteger(species_id) ||
    species_id <= 0 ||
    !start_date ||
    !Number.isInteger(egg_quantity) ||
    egg_quantity <= 0 ||
    !["incubating", "hatched", "failed"].includes(status)
  ) {
    return { success: false, message: "Periksa kembali data yang diisi." };
  }

  const { error } = await supabase.from("hatchery_batches").insert({
    batch_code,
    species_id,
    start_date,
    egg_quantity,
    expected_hatch_date: expected || null,
    status,
    notes: notes || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);

  return {
    success: true,
    message: "Batch penetasan berhasil ditambahkan.",
  };
}

export async function updateHatcheryBatch(id: number, formData: FormData) {
  const supabase = await createClient();

  const batch_code = String(formData.get("batch_code") || "").trim();
  const species_id = Number(formData.get("species_id"));
  const start_date = String(formData.get("start_date") || "");
  const egg_quantity = Number(formData.get("egg_quantity"));
  const expected = String(formData.get("expected_hatch_date") || "");
  const status = String(formData.get("status") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !batch_code ||
    !Number.isInteger(species_id) ||
    species_id <= 0 ||
    !start_date ||
    !Number.isInteger(egg_quantity) ||
    egg_quantity <= 0 ||
    !["incubating", "hatched", "failed"].includes(status)
  ) {
    return { success: false, message: "Data batch tidak valid." };
  }

  const { error } = await supabase
    .from("hatchery_batches")
    .update({
      batch_code,
      species_id,
      start_date,
      egg_quantity,
      expected_hatch_date: expected || null,
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);

  return {
    success: true,
    message: "Batch penetasan berhasil diperbarui.",
  };
}

export async function deleteHatcheryBatch(id: number) {
  const supabase = await createClient();

  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "ID batch tidak valid." };
  }

  const { error } = await supabase
    .from("hatchery_batches")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);

  return {
    success: true,
    message: "Batch penetasan berhasil dihapus.",
  };
}

export async function createCandlingRecord(formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const candlingDate = String(formData.get("candling_date") || "");
  const ageDays = Number(formData.get("age_days"));
  const fertileCount = Number(formData.get("fertile_count"));
  const infertileCount = Number(formData.get("infertile_count"));
  const deadEmbryoCount = Number(formData.get("dead_embryo_count"));
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !candlingDate ||
    !Number.isInteger(ageDays) ||
    ageDays < 0 ||
    !Number.isInteger(fertileCount) ||
    fertileCount < 0 ||
    !Number.isInteger(infertileCount) ||
    infertileCount < 0 ||
    !Number.isInteger(deadEmbryoCount) ||
    deadEmbryoCount < 0
  ) {
    return {
      success: false,
      message: "Periksa kembali data candling yang diisi.",
    };
  }

  const { error } = await supabase.from("hatchery_candling_records").insert({
    batch_id: batchId,
    candling_date: candlingDate,
    age_days: ageDays,
    fertile_count: fertileCount,
    infertile_count: infertileCount,
    dead_embryo_count: deadEmbryoCount,
    notes: notes || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${batchId}`);

  return {
    success: true,
    message: "Data candling berhasil ditambahkan.",
  };
}

export async function updateCandlingRecord(id: number, formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const candlingDate = String(formData.get("candling_date") || "");
  const ageDays = Number(formData.get("age_days"));
  const fertileCount = Number(formData.get("fertile_count"));
  const infertileCount = Number(formData.get("infertile_count"));
  const deadEmbryoCount = Number(formData.get("dead_embryo_count"));
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !candlingDate ||
    !Number.isInteger(ageDays) ||
    ageDays < 0 ||
    !Number.isInteger(fertileCount) ||
    fertileCount < 0 ||
    !Number.isInteger(infertileCount) ||
    infertileCount < 0 ||
    !Number.isInteger(deadEmbryoCount) ||
    deadEmbryoCount < 0
  ) {
    return {
      success: false,
      message: "Periksa kembali data candling yang diisi.",
    };
  }

  const { error } = await supabase
    .from("hatchery_candling_records")
    .update({
      candling_date: candlingDate,
      age_days: ageDays,
      fertile_count: fertileCount,
      infertile_count: infertileCount,
      dead_embryo_count: deadEmbryoCount,
      notes: notes || null,
    })
    .eq("id", id)
    .eq("batch_id", batchId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${batchId}`);

  return {
    success: true,
    message: "Data candling berhasil diperbarui.",
  };
}

export async function createHatcheryResult(formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const hatchDate = String(formData.get("hatch_date") || "");
  const hatchedCount = Number(formData.get("hatched_count"));
  const failedCount = Number(formData.get("failed_count"));
  const survivalCount = Number(formData.get("survival_count"));
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !hatchDate ||
    !Number.isInteger(hatchedCount) ||
    hatchedCount < 0 ||
    !Number.isInteger(failedCount) ||
    failedCount < 0 ||
    !Number.isInteger(survivalCount) ||
    survivalCount < 0
  ) {
    return {
      success: false,
      message: "Periksa kembali data hasil penetasan.",
    };
  }

  const { error } = await supabase.from("hatchery_result").insert({
    batch_id: batchId,
    hatch_date: hatchDate,
    hatched_count: hatchedCount,
    failed_count: failedCount,
    survival_count: survivalCount,
    notes: notes || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${batchId}`);

  return {
    success: true,
    message: "Hasil penetasan berhasil ditambahkan.",
  };
}

export async function updateHatcheryResult(id: number, formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const hatchDate = String(formData.get("hatch_date") || "");
  const hatchedCount = Number(formData.get("hatched_count"));
  const failedCount = Number(formData.get("failed_count"));
  const survivalCount = Number(formData.get("survival_count"));
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !hatchDate ||
    !Number.isInteger(hatchedCount) ||
    hatchedCount < 0 ||
    !Number.isInteger(failedCount) ||
    failedCount < 0 ||
    !Number.isInteger(survivalCount) ||
    survivalCount < 0
  ) {
    return {
      success: false,
      message: "Data hasil penetasan tidak valid.",
    };
  }

  const { error } = await supabase
    .from("hatchery_result")
    .update({
      hatch_date: hatchDate,
      hatched_count: hatchedCount,
      failed_count: failedCount,
      survival_count: survivalCount,
      notes: notes || null,
    })
    .eq("id", id)
    .eq("batch_id", batchId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${batchId}`);

  return {
    success: true,
    message: "Hasil penetasan berhasil diperbarui.",
  };
}

const EGG_COLLECTION_PATH = "/hatchery/egg-collection";

export async function getEggCollectionRecords() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("egg_collection_records")
    .select("*")
    .order("collection_date", { ascending: false });

  if (error) {
    return {
      success: false as const,
      message: error.message,
      data: [],
    };
  }

  return {
    success: true as const,
    message: "Berhasil",
    data: data ?? [],
  };
}

export async function createEggCollectionRecord(formData: FormData) {
  const supabase = await createClient();

  const speciesId = Number(formData.get("species_id"));
  const collectionDate = String(formData.get("collection_date") || "");
  const quantity = Number(formData.get("quantity"));
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(speciesId) ||
    speciesId <= 0 ||
    !collectionDate ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return {
      success: false,
      message: "Periksa kembali jenis ternak, tanggal, dan jumlah telur.",
    };
  }

  const { error } = await supabase.from("egg_collection_records").insert({
    species_id: speciesId,
    collection_date: collectionDate,
    quantity,
    notes: notes || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(EGG_COLLECTION_PATH);

  return {
    success: true,
    message: "Data pengumpulan telur berhasil ditambahkan.",
  };
}

export async function updateEggCollectionRecord(
  id: number,
  formData: FormData,
) {
  const supabase = await createClient();

  const speciesId = Number(formData.get("species_id"));
  const collectionDate = String(formData.get("collection_date") || "");
  const quantity = Number(formData.get("quantity"));
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(speciesId) ||
    speciesId <= 0 ||
    !collectionDate ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return {
      success: false,
      message: "Data pengumpulan telur tidak valid.",
    };
  }

  const { error } = await supabase
    .from("egg_collection_records")
    .update({
      species_id: speciesId,
      collection_date: collectionDate,
      quantity,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(EGG_COLLECTION_PATH);

  return {
    success: true,
    message: "Data pengumpulan telur berhasil diperbarui.",
  };
}

export async function deleteEggCollectionRecord(id: number) {
  const supabase = await createClient();

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      message: "ID pengumpulan telur tidak valid.",
    };
  }

  const { error } = await supabase
    .from("egg_collection_records")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(EGG_COLLECTION_PATH);

  return {
    success: true,
    message: "Data pengumpulan telur berhasil dihapus.",
  };
}
