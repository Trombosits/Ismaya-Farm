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

function generateBatchCode(speciesCode: string, startDate: string, id: number) {
  const year = startDate.slice(0, 4);
  const sequence = String(id).padStart(3, "0");

  return `${speciesCode}-${year}-${sequence}`;
}

async function isEggLayingSpecies(speciesId: number): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("livestock_species")
    .select("id")
    .eq("id", speciesId)
    .eq("reproduction_types", "LAY_EGG")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memvalidasi jenis ternak: ${error.message}`);
  }

  return Boolean(data);
}

export async function getSpeciesOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("livestock_species")
    .select("id, name, code")
    .eq("reproduction_types", "LAY_EGG")
    .order("name", { ascending: true });

  if (error) {
    return {
      success: false as const,
      message: error.message,
      data: [],
    };
  }

  return {
    success: true as const,
    message: "Berhasil mengambil jenis ternak.",
    data: data ?? [],
  };
}

export async function getHatcheryBatches() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_batches")
    .select(
      `
      id,
      species_id,
      start_date,
      egg_quantity,
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

  const speciesIds = [
    ...new Set((data ?? []).map((batch) => batch.species_id)),
  ];

  const { data: speciesData, error: speciesError } = await supabase
    .from("livestock_species")
    .select("id, name, code")
    .in("id", speciesIds);

  if (speciesError) {
    return {
      success: false as const,
      message: speciesError.message,
      data: [],
    };
  }

  const speciesMap = new Map(
    (speciesData ?? []).map((species) => [species.id, species]),
  );

  const batches: HatcheryBatch[] = (data ?? []).map((batch) => {
    const species = speciesMap.get(batch.species_id);

    const year = batch.start_date.slice(0, 4);
    const batchCode = species
      ? `${species.code}-${year}-${String(batch.id).padStart(3, "0")}`
      : `UNKNOWN-${year}-${String(batch.id).padStart(3, "0")}`;

    return {
      ...batch,
      batch_code: batchCode,
      species_name: species?.name ?? "Jenis ternak tidak ditemukan",
      species_code: species?.code ?? "",
      status: batch.status as HatcheryBatchStatus,
    };
  });

  return {
    success: true as const,
    message: "Berhasil mengambil data batch.",
    data: batches,
  };
}

export async function createHatcheryBatch(formData: FormData) {
  const supabase = await createClient();

  const speciesId = Number(formData.get("species_id"));
  const startDate = String(formData.get("start_date") || "");
  const eggQuantity = Number(formData.get("egg_quantity"));
  const status = String(formData.get("status") || "incubating");
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(speciesId) ||
    speciesId <= 0 ||
    !startDate ||
    !Number.isInteger(eggQuantity) ||
    eggQuantity <= 0 ||
    !["incubating", "hatched", "failed"].includes(status)
  ) {
    return {
      success: false,
      message: "Periksa kembali data batch yang diisi.",
    };
  }

  try {
    const isValidSpecies = await isEggLayingSpecies(speciesId);

    if (!isValidSpecies) {
      return {
        success: false,
        message: "Jenis ternak harus merupakan ternak yang bertelur.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memvalidasi jenis ternak.",
    };
  }

  const { error } = await supabase.from("hatchery_batches").insert({
    species_id: speciesId,
    start_date: startDate,
    egg_quantity: eggQuantity,
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

  const speciesId = Number(formData.get("species_id"));
  const startDate = String(formData.get("start_date") || "");
  const eggQuantity = Number(formData.get("egg_quantity"));
  const status = String(formData.get("status") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(speciesId) ||
    speciesId <= 0 ||
    !startDate ||
    !Number.isInteger(eggQuantity) ||
    eggQuantity <= 0 ||
    !["incubating", "hatched", "failed"].includes(status)
  ) {
    return {
      success: false,
      message: "Data batch tidak valid.",
    };
  }

  try {
    const isValidSpecies = await isEggLayingSpecies(speciesId);

    if (!isValidSpecies) {
      return {
        success: false,
        message: "Jenis ternak harus merupakan ternak yang bertelur.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memvalidasi jenis ternak.",
    };
  }

  const { error } = await supabase
    .from("hatchery_batches")
    .update({
      species_id: speciesId,
      start_date: startDate,
      egg_quantity: eggQuantity,
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
  const fertileCount = Number(formData.get("fertile_count"));
  const infertileCount = Number(formData.get("infertile_count"));
  const deadEmbryoCount = Number(formData.get("dead_embryo_count") || 0);
  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !candlingDate ||
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

  try {
    const ageDays = await validateCandling(
      batchId,
      candlingDate,
      fertileCount,
      infertileCount,
      deadEmbryoCount,
    );

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
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data candling.",
    };
  }
}

export async function updateCandlingRecord(id: number, formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const candlingDate = String(formData.get("candling_date") || "");
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

  try {
    const ageDays = await validateCandling(
      batchId,
      candlingDate,
      fertileCount,
      infertileCount,
      deadEmbryoCount,
      id,
    );

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
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${batchId}`);

    return {
      success: true,
      message: "Data candling berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data candling.",
    };
  }
}

export async function deleteCandlingRecord(id: number, batchId: number) {
  const supabase = await createClient();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(batchId) ||
    batchId <= 0
  ) {
    return {
      success: false as const,
      message: "ID data candling tidak valid.",
    };
  }

  const { error } = await supabase
    .from("hatchery_candling_records")
    .delete()
    .eq("id", id)
    .eq("batch_id", batchId);

  if (error) {
    return {
      success: false as const,
      message: error.message,
    };
  }

  revalidatePath("/hatchery/batches");
  revalidatePath(`/hatchery/batches/${batchId}`);

  return {
    success: true as const,
    message: "Data candling berhasil dihapus.",
  };
}

async function validateCandling(
  batchId: number,
  candlingDate: string,
  fertileCount: number,
  infertileCount: number,
  deadEmbryoCount: number,
  excludeRecordId?: number,
) {
  const supabase = await createClient();

  const { data: batch, error: batchError } = await supabase
    .from("hatchery_batches")
    .select("start_date, egg_quantity")
    .eq("id", batchId)
    .single();

  if (batchError || !batch) {
    throw new Error("Batch penetasan tidak ditemukan.");
  }

  if (candlingDate < batch.start_date) {
    throw new Error(
      "Tanggal candling tidak boleh sebelum tanggal mulai batch.",
    );
  }

  // Ambil seluruh candling sebelumnya.
  const { data: candlings, error: candlingError } = await supabase
    .from("hatchery_candling_records")
    .select("id, candling_date, fertile_count, infertile_count")
    .eq("batch_id", batchId)
    .order("candling_date", { ascending: false })
    .order("id", { ascending: false });

  if (candlingError) {
    throw new Error(
      `Gagal mengambil data candling sebelumnya: ${candlingError.message}`,
    );
  }

  const previousCandling = (candlings ?? []).find((item) => {
    if (item.id === excludeRecordId) return false;

    return (
      item.candling_date < candlingDate ||
      (item.candling_date === candlingDate &&
        (excludeRecordId === undefined || item.id < excludeRecordId))
    );
  });

  // Jumlah seluruh telur yang sudah menetas.
  const { data: hatchResults, error: resultError } = await supabase
    .from("hatchery_result")
    .select("hatched_count")
    .eq("batch_id", batchId);

  if (resultError) {
    throw new Error(`Gagal mengambil hasil penetasan: ${resultError.message}`);
  }

  const totalHatched = (hatchResults ?? []).reduce(
    (total, item) => total + item.hatched_count,
    0,
  );

  // Jika sudah ada candling sebelumnya, gunakan sisa dari candling tersebut.
  // Jika belum ada, gunakan jumlah telur awal batch.
  const previousAvailable = previousCandling
    ? previousCandling.fertile_count - previousCandling.infertile_count
    : batch.egg_quantity;

  const maxFertile = Math.max(0, previousAvailable - totalHatched);

  if (fertileCount > maxFertile) {
    throw new Error(
      `Jumlah fertile melebihi batas maksimum. Maksimum fertile saat ini adalah ${maxFertile} telur.`,
    );
  }

  if (fertileCount + infertileCount > batch.egg_quantity) {
    throw new Error(
      "Jumlah fertile dan infertile tidak boleh melebihi jumlah telur dalam batch.",
    );
  }

  if (deadEmbryoCount > fertileCount) {
    throw new Error("Jumlah embrio mati tidak boleh melebihi jumlah fertile.");
  }

  const start = new Date(`${batch.start_date}T00:00:00Z`);
  const end = new Date(`${candlingDate}T00:00:00Z`);

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getLatestCandling(batchId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hatchery_candling_records")
    .select("fertile_count, infertile_count, dead_embryo_count")
    .eq("batch_id", batchId)
    .order("candling_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      success: false as const,
      message: error.message,
      data: null,
    };
  }

  return {
    success: true as const,
    message: "Berhasil",
    data,
  };
}
async function validateHatcheryResult(
  batchId: number,
  hatchDate: string,
  hatchedCount: number,
  failedCount: number,
  excludeRecordId?: number,
) {
  const supabase = await createClient();

  // Ambil tanggal mulai batch.
  const { data: batch, error: batchError } = await supabase
    .from("hatchery_batches")
    .select("start_date")
    .eq("id", batchId)
    .single();

  if (batchError || !batch) {
    throw new Error("Batch penetasan tidak ditemukan.");
  }

  if (hatchDate < batch.start_date) {
    throw new Error("Tanggal menetas tidak boleh sebelum tanggal mulai batch.");
  }

  // Ambil candling terakhir.
  const latest = await getLatestCandling(batchId);

  if (!latest.success || !latest.data) {
    throw new Error(
      "Data candling belum tersedia. Tambahkan data candling terlebih dahulu.",
    );
  }

  const fertileCount = latest.data.fertile_count;

  // Ambil hasil penetasan yang sudah tercatat.
  const { data: results, error: resultError } = await supabase
    .from("hatchery_result")
    .select("id, hatched_count, failed_count")
    .eq("batch_id", batchId);

  if (resultError) {
    throw new Error(`Gagal mengambil hasil penetasan: ${resultError.message}`);
  }

  // Ketika edit, keluarkan data yang sedang diedit dari perhitungan.
  const previousResults = (results ?? []).filter(
    (item) => item.id !== excludeRecordId,
  );

  const alreadyProcessed = previousResults.reduce(
    (total, item) => total + item.hatched_count + item.failed_count,
    0,
  );

  const maxAvailable = Math.max(0, fertileCount - alreadyProcessed);

  if (hatchedCount + failedCount > maxAvailable) {
    throw new Error(
      `Jumlah berhasil dan gagal melebihi batas. Sisa telur fertile yang tersedia adalah ${maxAvailable}.`,
    );
  }

  if (hatchedCount === 0 && failedCount === 0) {
    throw new Error("Jumlah berhasil atau gagal harus lebih dari 0.");
  }

  return {
    fertileCount,
    maxAvailable,
  };
}

export async function createHatcheryResult(formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const hatchDate = String(formData.get("hatch_date") || "");

  // Jika kosong, otomatis dianggap 0.
  const hatchedCount = Number(formData.get("hatched_count") || 0);
  const failedCount = Number(formData.get("failed_count") || 0);

  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !hatchDate ||
    !Number.isInteger(hatchedCount) ||
    !Number.isInteger(failedCount) ||
    hatchedCount < 0 ||
    failedCount < 0
  ) {
    return {
      success: false,
      message: "Periksa kembali data hasil penetasan.",
    };
  }

  try {
    await validateHatcheryResult(batchId, hatchDate, hatchedCount, failedCount);

    const { error } = await supabase.from("hatchery_result").insert({
      batch_id: batchId,
      hatch_date: hatchDate,
      hatched_count: hatchedCount,
      failed_count: failedCount,
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
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan hasil penetasan.",
    };
  }
}

export async function updateHatcheryResult(id: number, formData: FormData) {
  const supabase = await createClient();

  const batchId = Number(formData.get("batch_id"));
  const hatchDate = String(formData.get("hatch_date") || "");

  const hatchedCount = Number(formData.get("hatched_count") || 0);
  const failedCount = Number(formData.get("failed_count") || 0);

  const notes = String(formData.get("notes") || "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(batchId) ||
    batchId <= 0 ||
    !hatchDate ||
    !Number.isInteger(hatchedCount) ||
    !Number.isInteger(failedCount) ||
    hatchedCount < 0 ||
    failedCount < 0
  ) {
    return {
      success: false,
      message: "Data hasil penetasan tidak valid.",
    };
  }

  try {
    await validateHatcheryResult(
      batchId,
      hatchDate,
      hatchedCount,
      failedCount,
      id,
    );

    const { error } = await supabase
      .from("hatchery_result")
      .update({
        hatch_date: hatchDate,
        hatched_count: hatchedCount,
        failed_count: failedCount,
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
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui hasil penetasan.",
    };
  }
}

export async function deleteHatcheryResult(id: number, batchId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hatchery_result")
    .delete()
    .eq("id", id)
    .eq("batch_id", batchId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/hatchery/batches");
  revalidatePath(`/hatchery/batches/${batchId}`);

  return {
    success: true,
    message: "Hasil penetasan berhasil dihapus.",
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

  try {
    if (!(await isEggLayingSpecies(speciesId))) {
      return {
        success: false,
        message: "Jenis ternak harus merupakan ternak yang bertelur.",
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
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data pengumpulan telur.",
    };
  }
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
  try {
    if (!(await isEggLayingSpecies(speciesId))) {
      return {
        success: false,
        message: "Jenis ternak harus merupakan ternak yang bertelur.",
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
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data pengumpulan telur.",
    };
  }
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
