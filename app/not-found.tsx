import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Logo showWordmark={false} />
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-xs font-semibold tracking-wider text-subtle uppercase">
          Kesalahan 404
        </p>
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="max-w-sm text-sm text-muted">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Kembali ke Ringkasan
      </Link>
    </main>
  );
}
