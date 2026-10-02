"use client";

import Link from "next/link";

import { Section, SectionHeader } from "@/components/ui/section";
import {
  getBreedName,
  getChildrenOf,
  getLivestockById,
  type Livestock,
} from "@/lib/livestock";

function RelationReference({ id }: { id: string | null }) {
  const animal = id ? getLivestockById(id) : undefined;
  if (!animal) {
    return <span className="text-sm text-muted">Tidak tercatat</span>;
  }
  return (
    <Link
      href={`/livestock/${animal.id}`}
      className="text-sm font-medium text-brand-700 hover:underline"
    >
      {animal.tag_code} — {getBreedName(animal.breed_id)}
    </Link>
  );
}

function RelationBox({
  label,
  id,
}: {
  label: string;
  id: string | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface px-3.5 py-3">
      <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
        {label}
      </span>
      <RelationReference id={id} />
    </div>
  );
}

export function GenealogyTab({ animal }: { animal: Livestock }) {
  const children = getChildrenOf(animal.id);

  return (
    <Section>
      <SectionHeader
        title="Silsilah"
        description={`Hubungan keluarga untuk ${animal.tag_code}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <RelationBox label="Induk Betina" id={animal.mother_id} />
        <RelationBox label="Induk Jantan" id={animal.father_id} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
          Anak-anak
        </span>
        {children.length === 0 ? (
          <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-6 text-center text-sm text-muted">
            Belum ada anak yang tercatat.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/livestock/${child.id}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-colors hover:bg-panel"
                >
                  <span className="font-mono text-[13px] font-semibold text-ink">
                    {child.tag_code}
                  </span>
                  <span className="text-xs text-muted">
                    {getBreedName(child.breed_id)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
