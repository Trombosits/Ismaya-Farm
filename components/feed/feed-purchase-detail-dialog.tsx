"use client";

import { Button } from "@/components/ui/button";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import { Dialog } from "@/components/ui/dialog";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  getFeedTypeName,
  getFeedTypeUnit,
  type FeedPurchase,
  type FeedPurchaseItem,
  type FeedType,
} from "@/lib/feed";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatDate } from "@/lib/livestock";

interface FeedPurchaseDetailDialogProps {
  purchase: FeedPurchase;
  items: FeedPurchaseItem[];
  feedTypes: FeedType[];
  onClose: () => void;
}

export function FeedPurchaseDetailDialog({
  purchase,
  items,
  feedTypes,
  onClose,
}: FeedPurchaseDetailDialogProps) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Detail Pembelian"
      description={purchase.invoice_number || "Tanpa nomor invoice"}
      className="max-w-2xl"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <DescriptionList columns={2}>
          <DescriptionItem label="Tanggal">
            {formatDate(purchase.purchase_date)}
          </DescriptionItem>
          <DescriptionItem label="Supplier">
            {purchase.supplier || "—"}
          </DescriptionItem>
          <DescriptionItem label="No. Invoice">
            <span className="font-mono">{purchase.invoice_number || "—"}</span>
          </DescriptionItem>
          <DescriptionItem label="Total Pembelian">
            <span className="font-semibold">{formatCurrency(total)}</span>
          </DescriptionItem>
        </DescriptionList>

        <Table className="min-w-[520px]">
          <THead>
            <tr>
              <TH>Jenis Pakan</TH>
              <TH className="text-right">Qty</TH>
              <TH>Satuan</TH>
              <TH className="text-right">Harga Satuan</TH>
              <TH className="text-right">Subtotal</TH>
            </tr>
          </THead>
          <TBody>
            {items.map((item) => (
              <TR key={item.id}>
                <TD>{getFeedTypeName(feedTypes, item.feed_type_id)}</TD>
                <TD className="text-right">{formatNumber(item.quantity)}</TD>
                <TD className="text-muted">
                  {getFeedTypeUnit(feedTypes, item.feed_type_id)}
                </TD>
                <TD className="text-right">
                  {formatCurrency(item.unit_price)}
                </TD>
                <TD className="text-right font-medium">
                  {formatCurrency(item.subtotal)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>

        {purchase.notes ? (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
              Catatan
            </span>
            <p className="text-sm text-ink">{purchase.notes}</p>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
