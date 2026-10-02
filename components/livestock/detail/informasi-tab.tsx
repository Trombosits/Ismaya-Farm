"use client";

import Link from "next/link";

import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { Section, SectionHeader } from "@/components/ui/section";
import {
  ACQUISITION_LABEL,
  formatAge,
  formatDate,
  getBreedName,
  getLivestockById,
  getSpeciesName,
  SEX_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  type Livestock,
} from "@/lib/livestock";
import { Badge } from "@/components/ui/badge";

function ParentReference({ id }: { id: string | null }) {
  const parent = id ? getLivestockById(id) : undefined;

  if (!parent) {
    return <span className="text-muted">Tidak tercatat</span>;
  }

  return (
    <Link
      href={`/livestock/${parent.id}`}
      className="font-medium text-brand-700 hover:underline"
    >
      {parent.tag_code} — {getBreedName(parent.breed_id)}
    </Link>
  );
}

export function InformasiTab({ animal }: { animal: Livestock }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      <Section className="py-5 first:pt-0">
        <SectionHeader title="Informasi Dasar" />
        <DescriptionList columns={3}>
          <DescriptionItem label="Tag Code">
            <span className="font-mono font-semibold">{animal.tag_code}</span>
          </DescriptionItem>
          <DescriptionItem label="Jenis Ternak">
            {getSpeciesName(animal.species_id)}
          </DescriptionItem>
          <DescriptionItem label="Ras">
            {getBreedName(animal.breed_id)}
          </DescriptionItem>
          <DescriptionItem label="Jenis Kelamin">
            {SEX_LABEL[animal.sex]}
          </DescriptionItem>
          <DescriptionItem label="Tanggal Lahir">
            {formatDate(animal.birth_date)}
          </DescriptionItem>
          <DescriptionItem label="Umur">
            {formatAge(animal.birth_date)}
          </DescriptionItem>
          <DescriptionItem label="Status">
            <Badge variant={STATUS_BADGE[animal.status]}>
              {STATUS_LABEL[animal.status]}
            </Badge>
          </DescriptionItem>
        </DescriptionList>
      </Section>

      <Section className="py-5">
        <SectionHeader title="Perolehan" />
        <DescriptionList columns={2}>
          <DescriptionItem label="Tanggal Perolehan">
            {formatDate(animal.acquisition_date)}
          </DescriptionItem>
          <DescriptionItem label="Cara Perolehan">
            {ACQUISITION_LABEL[animal.acquisition_type]}
          </DescriptionItem>
        </DescriptionList>
      </Section>

      <Section className="py-5">
        <SectionHeader title="Asal / Induk" />
        <DescriptionList columns={2}>
          <DescriptionItem label="Induk Betina">
            <ParentReference id={animal.mother_id} />
          </DescriptionItem>
          <DescriptionItem label="Induk Jantan">
            <ParentReference id={animal.father_id} />
          </DescriptionItem>
        </DescriptionList>
      </Section>

      <Section className="py-5 last:pb-0">
        <SectionHeader title="Catatan" />
        {animal.notes ? (
          <p className="text-sm leading-relaxed text-ink">{animal.notes}</p>
        ) : (
          <p className="text-sm text-muted">Tidak ada catatan.</p>
        )}
      </Section>
    </div>
  );
}
