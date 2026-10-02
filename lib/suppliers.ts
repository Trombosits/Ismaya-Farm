/**
 * Shared supplier reference data used by feed purchases and general purchases.
 * Not a database entity of its own — only resolves `supplier_id` for display.
 */

export interface Supplier {
  id: string;
  name: string;
}

export const suppliers: Supplier[] = [
  { id: "sup-01", name: "CV Pakan Sejahtera" },
  { id: "sup-02", name: "UD Ternak Makmur" },
  { id: "sup-03", name: "PT Nutrisi Prima" },
  { id: "sup-04", name: "Toko Pakan Barokah" },
  { id: "sup-05", name: "Toko Bangunan Jaya" },
  { id: "sup-06", name: "Apotek Hewan Sehat" },
];

export function getSupplierName(id: string): string {
  return suppliers.find((supplier) => supplier.id === id)?.name ?? "—";
}
