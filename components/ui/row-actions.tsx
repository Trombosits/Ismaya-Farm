"use client";

import { Ellipsis, Pencil, Trash } from "lucide-react";

import { DropdownItem, DropdownMenu, DropdownSeparator } from "./dropdown";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  label?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function RowActions({
  onEdit,
  onDelete,
  label = "Aksi baris",
  editLabel = "Edit",
  deleteLabel = "Hapus",
}: RowActionsProps) {
  return (
    <DropdownMenu
      portal
      className="flex justify-end"
      trigger={
        <button
          type="button"
          aria-label={label}
          className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <Ellipsis className="size-4" />
        </button>
      }
    >
      <DropdownItem icon={<Pencil className="size-3.5" />} onClick={onEdit}>
        {editLabel}
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem
        icon={<Trash className="size-3.5" />}
        onClick={onDelete}
        className="text-danger hover:bg-danger-soft"
      >
        {deleteLabel}
      </DropdownItem>
    </DropdownMenu>
  );
}
