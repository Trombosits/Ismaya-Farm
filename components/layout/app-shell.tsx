"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/cn";

import { Logo } from "./logo";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka navigasi"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
          className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <Logo showWordmark={false} />
          <span className="text-sm font-semibold tracking-tight text-ink">
            ISMAYA
          </span>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border lg:block">
        <Sidebar />
      </aside>

      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !mobileOpen && "pointer-events-none")}
      >
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          id="app-sidebar"
          inert={!mobileOpen}
          className={cn(
            "absolute inset-y-0 left-0 w-64 max-w-[80vw] border-r border-border shadow-xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
