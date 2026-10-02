"use client";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import {
  DropdownItem,
  DropdownMenu,
} from "@/components/ui/dropdown";

export function UserMenu() {
  const router = useRouter();

  return (
    <DropdownMenu
      className="w-full"
      portal
      align="start"
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-brand-800"
        >
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white"
          >
            AD
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-ink text-white">Admin</span>
            <span className="truncate text-[11px] text-subtle-dark">
              Administrator
            </span>
          </span>
        </button>
      }
    >
      <DropdownItem 
        icon={<LogOut className="size-4 text-red-600" />}
        className="text-red-600 hover:bg-red-50"
        onClick={() => router.push("/login")}
      >
        Keluar
      </DropdownItem>
    </DropdownMenu>
  );
}
