"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  breedList,
  getBreedName,
  getBreedsBySpecies,
  getSpeciesName,
  livestockList,
  SEX_LABEL,
  speciesList,
  type LivestockSex,
} from "@/lib/livestock";

const PREVIEW_LIMIT = 100;

interface BulkAddDialogProps {
  open: boolean;
  onClose: () => void;
}

interface BulkFields {
  speciesId: string;
  breedId: string;
  sex: string;
  count: string;
  prefix: string;
  startNumber: string;
}

const INITIAL: BulkFields = {
  speciesId: "",
  breedId: "",
  sex: "female",
  count: "",
  prefix: "",
  startNumber: "1",
};

export function BulkAddDialog({ open, onClose }: BulkAddDialogProps) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState<BulkFields>(INITIAL);

  const breedOptions = fields.speciesId
    ? getBreedsBySpecies(fields.speciesId)
    : breedList;

  const count = Number(fields.count);
  const start = Number(fields.startNumber);

  const errors: Partial<Record<keyof BulkFields, string>> = {};
  if (!fields.speciesId) errors.speciesId = "Jenis ternak wajib dipilih.";
  if (!fields.breedId) errors.breedId = "Ras wajib dipilih.";
  if (!fields.sex) errors.sex = "Jenis kelamin wajib dipilih.";
  if (!Number.isFinite(count) || count <= 0)
    errors.count = "Jumlah harus lebih dari 0.";
  else if (count > 1000)
    errors.count = "Jumlah maksimal 1000 per proses massal.";
  if (!fields.prefix.trim()) errors.prefix = "Prefix kode wajib diisi.";
  if (!Number.isInteger(start) || start < 1)
    errors.startNumber = "Nomor mulai minimal 1.";

  const hasErrors = Object.keys(errors).length > 0;

  const codes =
    !hasErrors && Number.isFinite(count)
      ? Array.from({ length: count }, (_, index) =>
          buildCode(fields.prefix, start + index),
        )
      : [];

  const existingTags = new Set(livestockList.map((animal) => animal.tag_code));
  const conflicts = codes.filter((code) => existingTags.has(code));

  function update(patch: Partial<BulkFields>) {
    setFields((current) => ({ ...current, ...patch }));
  }

  function handleNext() {
    setSubmitted(true);
    if (hasErrors) return;
    setStep("preview");
  }

  function handleBack() {
    setStep("form");
  }

  function handleSubmit() {
    // Prototype only: no persistence. Simulated creation.
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Tambah Ternak Massal"
      description={
        step === "form"
          ? "Buat banyak data ternak individual dengan kode berurutan."
          : "Periksa daftar ternak yang akan dibuat sebelum konfirmasi."
      }
      className="max-w-2xl"
      footer={
        step === "form" ? (
          <>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button size="sm" onClick={handleNext}>
              Lanjut ke Preview
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={handleBack}>
              Kembali / Ubah Input
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={conflicts.length > 0}
            >
              Buat Ternak
            </Button>
          </>
        )
      }
    >
      {step === "form" ? (
        <div className="flex flex-col gap-6">
          <FormSection title="Data Massal">
            <Field
              label="Jenis Ternak"
              htmlFor="bulk-species"
              required
              error={submitted ? errors.speciesId : undefined}
            >
              <Select
                id="bulk-species"
                value={fields.speciesId}
                onChange={(event) =>
                  update({ speciesId: event.target.value, breedId: "" })
                }
              >
                <option value="" disabled>
                  Pilih jenis ternak
                </option>
                {speciesList.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Ras"
              htmlFor="bulk-breed"
              required
              error={submitted ? errors.breedId : undefined}
              hint={
                fields.speciesId ? undefined : "Pilih jenis ternak terlebih dahulu."
              }
            >
              <Select
                id="bulk-breed"
                value={fields.breedId}
                disabled={!fields.speciesId}
                onChange={(event) => update({ breedId: event.target.value })}
              >
                <option value="" disabled>
                  Pilih ras
                </option>
                {breedOptions.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Jenis Kelamin"
              htmlFor="bulk-sex"
              required
              error={submitted ? errors.sex : undefined}
            >
              <Select
                id="bulk-sex"
                value={fields.sex}
                onChange={(event) => update({ sex: event.target.value })}
              >
                {(Object.keys(SEX_LABEL) as LivestockSex[]).map((sex) => (
                  <option key={sex} value={sex}>
                    {SEX_LABEL[sex]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Jumlah Ternak"
              htmlFor="bulk-count"
              required
              error={submitted ? errors.count : undefined}
            >
              <Input
                id="bulk-count"
                type="number"
                min={1}
                value={fields.count}
                onChange={(event) => update({ count: event.target.value })}
                placeholder="Contoh: 50"
              />
            </Field>
            <Field
              label="Prefix Kode"
              htmlFor="bulk-prefix"
              required
              error={submitted ? errors.prefix : undefined}
              hint="Contoh: KMB → KMB-001"
            >
              <Input
                id="bulk-prefix"
                value={fields.prefix}
                onChange={(event) => update({ prefix: event.target.value })}
                placeholder="KMB"
                autoComplete="off"
                className="font-mono uppercase"
              />
            </Field>
            <Field
              label="Nomor Mulai"
              htmlFor="bulk-start"
              required
              error={submitted ? errors.startNumber : undefined}
            >
              <Input
                id="bulk-start"
                type="number"
                min={1}
                value={fields.startNumber}
                onChange={(event) => update({ startNumber: event.target.value })}
              />
            </Field>
          </FormSection>

          <p className="rounded-md border border-border bg-panel px-3 py-2.5 text-xs text-muted">
            Status seluruh ternak baru akan diatur otomatis ke{" "}
            <span className="font-medium text-ink">Aktif</span>. Tanggal lahir,
            induk, dan catatan tidak diisi pada proses massal ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-muted">
              Jenis:{" "}
              <span className="font-medium text-ink">
                {getSpeciesName(fields.speciesId)}
              </span>
            </span>
            <span className="text-muted">
              Ras:{" "}
              <span className="font-medium text-ink">
                {getBreedName(fields.breedId)}
              </span>
            </span>
            <span className="text-muted">
              Kelamin:{" "}
              <span className="font-medium text-ink">
                {SEX_LABEL[fields.sex as LivestockSex]}
              </span>
            </span>
          </div>

          {conflicts.length > 0 ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-danger/20 bg-danger-soft px-3 py-2.5"
            >
              <TriangleAlert
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-danger"
              />
              <p className="text-xs leading-relaxed text-danger">
                Ditemukan {conflicts.length} kode yang sudah digunakan (
                {conflicts.slice(0, 5).join(", ")}
                {conflicts.length > 5 ? ", …" : ""}). Sesuaikan prefix atau
                nomor mulai agar tidak duplikat.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted">
              <span className="font-medium text-ink">{codes.length}</span> ternak
              akan dibuat dengan kode berurutan{" "}
              <span className="font-mono text-ink">{codes[0]}</span> –{" "}
              <span className="font-mono text-ink">
                {codes[codes.length - 1]}
              </span>
              .
            </p>
          )}

          <Table containerClassName="max-h-[52vh] overflow-y-auto">
            <THead>
              <tr>
                <TH className="w-14 text-right">No.</TH>
                <TH>Tag Code</TH>
                <TH>Jenis</TH>
                <TH>Ras</TH>
                <TH>Jenis Kelamin</TH>
              </tr>
            </THead>
            <TBody>
              {codes.slice(0, PREVIEW_LIMIT).map((code, index) => (
                <TR key={code}>
                  <TD className="text-right text-xs text-muted">{index + 1}</TD>
                  <TD className="font-mono text-[13px] font-semibold">
                    {code}
                  </TD>
                  <TD>{getSpeciesName(fields.speciesId)}</TD>
                  <TD className="text-muted">
                    {getBreedName(fields.breedId)}
                  </TD>
                  <TD>{SEX_LABEL[fields.sex as LivestockSex]}</TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {codes.length > PREVIEW_LIMIT ? (
            <p className="text-xs text-subtle">
              Menampilkan {PREVIEW_LIMIT} baris pertama dari {codes.length}{" "}
              data. Seluruh data tetap akan dibuat sesuai jumlah.
            </p>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}

function buildCode(prefix: string, value: number): string {
  const normalized = prefix.trim().toUpperCase();
  return `${normalized}-${String(value).padStart(3, "0")}`;
}
