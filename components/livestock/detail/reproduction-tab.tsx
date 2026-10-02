"use client";

import { useRouter } from "next/navigation";

import { LivestockCell } from "@/components/livestock/livestock-cell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDate, type Livestock } from "@/lib/livestock";
import {
  REPRODUCTION_STATUS_BADGE,
  REPRODUCTION_STATUS_LABEL,
  getReproductionByLivestock,
} from "@/lib/reproduction";

export function ReproductionTab({ animal }: { animal: Livestock }) {
  const router = useRouter();
  const records = getReproductionByLivestock(animal.id);

  return (
    <Section>
      <SectionHeader
        title="Riwayat Reproduksi"
        description={`Perkawinan yang melibatkan ${animal.tag_code} sebagai betina maupun jantan.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/livestock/reproduction")}
          >
            Buka Modul Perkawinan
          </Button>
        }
      />

      {records.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong bg-panel px-4 py-8 text-center text-sm text-muted">
          Belum ada riwayat reproduksi.
        </p>
      ) : (
        <Table className="min-w-[920px]">
          <THead>
            <tr>
              <TH>Pasangan</TH>
              <TH>Peran</TH>
              <TH>Tanggal Kawin</TH>
              <TH className="hidden md:table-cell">Kebuntingan</TH>
              <TH className="hidden lg:table-cell">Perkiraan Lahir</TH>
              <TH className="hidden lg:table-cell">Lahir Aktual</TH>
              <TH>Status</TH>
              <TH className="hidden lg:table-cell">Catatan</TH>
            </tr>
          </THead>
          <TBody>
            {records.map((record) => {
              const isFemale = record.female_livestock_id === animal.id;
              const partnerId = isFemale
                ? record.male_livestock_id
                : record.female_livestock_id;
              return (
                <TR key={record.id}>
                  <TD>
                    <LivestockCell id={partnerId} />
                  </TD>
                  <TD>{isFemale ? "Betina" : "Jantan"}</TD>
                  <TD className="whitespace-nowrap text-xs text-muted">
                    {formatDate(record.mating_date)}
                  </TD>
                  <TD className="hidden whitespace-nowrap text-xs text-muted md:table-cell">
                    {record.pregnancy_date
                      ? formatDate(record.pregnancy_date)
                      : "—"}
                  </TD>
                  <TD className="hidden whitespace-nowrap text-xs text-muted lg:table-cell">
                    {record.expected_birth_date
                      ? formatDate(record.expected_birth_date)
                      : "—"}
                  </TD>
                  <TD className="hidden whitespace-nowrap text-xs text-muted lg:table-cell">
                    {record.actual_birth_date
                      ? formatDate(record.actual_birth_date)
                      : "—"}
                  </TD>
                  <TD>
                    <Badge variant={REPRODUCTION_STATUS_BADGE[record.status]}>
                      {REPRODUCTION_STATUS_LABEL[record.status]}
                    </Badge>
                  </TD>
                  <TD className="hidden max-w-48 truncate text-xs text-muted lg:table-cell">
                    {record.notes || "—"}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </Section>
  );
}
