import { SearchX } from "lucide-react";

import type { TableViewState } from "@/lib/view-state";

import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { TableSkeleton } from "./table-skeleton";

interface TableStatePanelProps {
  state: TableViewState;
  onRetry: () => void;
  columns: number;
  rows?: number;
  searchEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  pagination?: React.ReactNode;
  children: React.ReactNode;
}

export function TableStatePanel({
  state,
  onRetry,
  columns,
  rows = 8,
  searchEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  children,
}: TableStatePanelProps) {
  if (state === "loading") {
    return <TableSkeleton rows={rows} columns={columns} />;
  }

  if (state === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  if (state === "empty") {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  if (searchEmpty) {
    return (
      <EmptyState
        icon={<SearchX className="size-4" />}
        title="Tidak ada data yang sesuai"
        description="Coba ubah kata pencarian atau filter yang digunakan."
      />
    );
  }

  return (
    <>
      {children}
      {pagination}
    </>
  );
}
