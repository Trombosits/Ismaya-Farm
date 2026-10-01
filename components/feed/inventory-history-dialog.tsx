"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  getFeedTypeUnit,
  getTransactionReference,
  getTransactionsByFeedType,
  TRANSACTION_TYPE_LABEL,
  type FeedType,
} from "@/lib/feed";
import { formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";

interface InventoryHistoryDialogProps {
  feedType: FeedType;
  onClose: () => void;
}

export function InventoryHistoryDialog({
  feedType,
  onClose,
}: InventoryHistoryDialogProps) {
  const transactions = getTransactionsByFeedType(feedType.id);
  const unit = getFeedTypeUnit(feedType.id);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Riwayat Transaksi Stok"
      description={`${feedType.name} · satuan ${unit}`}
      className="max-w-3xl"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      {transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Belum ada transaksi stok.
        </p>
      ) : (
        <Table className="min-w-[620px]">
          <THead>
            <tr>
              <TH>Tanggal</TH>
              <TH>Jenis Pakan</TH>
              <TH>Tipe</TH>
              <TH className="text-right">Quantity</TH>
              <TH>Reference</TH>
              <TH>Catatan</TH>
            </tr>
          </THead>
          <TBody>
            {transactions.map((transaction) => (
              <TR key={transaction.id}>
                <TD className="whitespace-nowrap text-xs text-muted">
                  {formatDate(transaction.transaction_date)}
                </TD>
                <TD>{feedType.name}</TD>
                <TD>
                  <Badge
                    variant={
                      transaction.transaction_type === "in"
                        ? "success"
                        : "neutral"
                    }
                  >
                    {TRANSACTION_TYPE_LABEL[transaction.transaction_type]}
                  </Badge>
                </TD>
                <TD className="text-right">
                  {formatNumber(transaction.quantity)} {unit}
                </TD>
                <TD className="text-xs text-muted">
                  {getTransactionReference(transaction)}
                </TD>
                <TD className="max-w-40 truncate text-xs text-muted">
                  {transaction.notes || "—"}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </Dialog>
  );
}
