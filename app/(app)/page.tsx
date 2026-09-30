import type { Metadata } from "next";
import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Section, SectionHeader } from "@/components/ui/section";
import { navigation } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Ringkasan",
};

export default function OverviewPage() {
  const plannedGroups = navigation.filter((group) =>
    group.items.some((item) => item.status === "coming-soon"),
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ringkasan"
        description="Ikhtisar sistem manajemen operasional peternakan ISMAYA."
      />

      <Section>
        <SectionHeader
          title="Tentang sistem ini"
          description="Kerangka aplikasi untuk pengelolaan data peternakan dan pertanian."
        />
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Aplikasi ini digunakan untuk mencatat dan mengelola data operasional
          peternakan secara terpusat, mulai dari data ternak, kesehatan,
          reproduksi, pakan, penetasan, hingga produk dan penjualan.
        </p>
        <div className="flex max-w-3xl items-start gap-2.5 rounded-md border border-border bg-panel px-3 py-2.5">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
          <p className="text-xs leading-relaxed text-muted">
            Tahap ini baru menyiapkan fondasi antarmuka: struktur navigasi,
            tata letak, dan komponen dasar. Modul data akan diimplementasikan
            pada tahap berikutnya.
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Peta modul"
          description="Struktur modul yang direncanakan untuk aplikasi."
        />
        <dl className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
          {plannedGroups.map((group) => (
            <div
              key={group.label}
              className="grid gap-2 px-3.5 py-3 sm:grid-cols-[160px_1fr] sm:gap-4"
            >
              <dt className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                {group.label}
              </dt>
              <dd className="flex flex-wrap gap-x-5 gap-y-2">
                {group.items.map((item) => (
                  <span
                    key={item.href}
                    className="inline-flex items-center gap-1.5 text-sm text-ink"
                  >
                    {item.label}
                    <Badge variant="neutral">Segera</Badge>
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
