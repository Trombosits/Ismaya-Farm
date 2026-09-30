"use client";

import { LogOut, Settings } from "lucide-react";

import {
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
} from "@/components/ui/dropdown";

export function UserMenu() {
  return (
    <DropdownMenu
      className="w-full"
      align="start"
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-canvas"
        >
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white"
          >
            AD
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-ink">Admin</span>
            <span className="truncate text-[11px] text-subtle">
              Administrator
            </span>
          </span>
        </button>
      }
    >
      <DropdownItem icon={<Settings className="size-4" />} disabled>
        Pengaturan Akun
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem icon={<LogOut className="size-4" />} disabled>
        Keluar
      </DropdownItem>
    </DropdownMenu>
  );
}
