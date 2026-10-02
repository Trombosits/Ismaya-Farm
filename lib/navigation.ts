import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Boxes,
  ChartColumn,
  Dna,
  Egg,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  ListTree,
  Package,
  PawPrint,
  Receipt,
  Shapes,
  ShoppingCart,
  Tags,
  Thermometer,
  Truck,
  Users,
  Wheat,
} from "lucide-react";

export type NavStatus = "available" | "coming-soon";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  status: NavStatus;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/**
 * Application information architecture.
 *
 * Only routes that physically exist in `app/` may be marked `available`.
 * Everything else is part of the long-term structure and is rendered as a
 * disabled item until its module is implemented.
 */
export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dasbor",
        href: "/",
        icon: LayoutDashboard,
        status: "available",
      },
    ],
  },
  {
    label: "Data",
    items: [
      {
        label: "Data Ternak",
        href: "/livestock",
        icon: PawPrint,
        status: "available",
      },
      {
        label: "Jenis Ternak",
        href: "/livestock/species",
        icon: Tags,
        status: "available",
      },
      {
        label: "Ras Ternak",
        href: "/livestock/breeds",
        icon: Dna,
        status: "available",
      },
    ],
  },
  {
    label: "Kesehatan",
    items: [
      {
        label: "Riwayat Kesehatan",
        href: "/health",
        icon: HeartPulse,
        status: "available",
      },
    ],
  },
  {
    label: "Reproduksi",
    items: [
      {
        label: "Perkawinan",
        href: "/livestock/reproduction",
        icon: HeartHandshake,
        status: "available",
      },
      {
        label: "Kelahiran",
        href: "/livestock/births",
        icon: Baby,
        status: "available",
      },
    ],
  },
  {
    label: "Pakan",
    items: [
      {
        label: "Jenis Pakan",
        href: "/feed/types",
        icon: Wheat,
        status: "available",
      },
      {
        label: "Pembelian Pakan",
        href: "/feed/purchases",
        icon: ShoppingCart,
        status: "available",
      },
      {
        label: "Stok Pakan",
        href: "/feed/inventory",
        icon: Boxes,
        status: "available",
      },
    ],
  },
  {
    label: "Penetasan",
    items: [
      {
        label: "Pengumpulan Telur",
        href: "/hatchery/egg-collection",
        icon: Egg,
        status: "available",
      },
      {
        label: "Batch Penetasan",
        href: "/hatchery/batches",
        icon: Thermometer,
        status: "available",
      },
    ],
  },
  {
    label: "Produk & Penjualan",
    items: [
      {
        label: "Kategori Produk",
        href: "/products/categories",
        icon: Shapes,
        status: "available",
      },
      {
        label: "Produk",
        href: "/products",
        icon: Package,
        status: "available",
      },
      {
        label: "Penjualan",
        href: "/sales",
        icon: Receipt,
        status: "available",
      },
    ],
  },
  {
    label: "Pembelian",
    items: [
      {
        label: "Kategori Pembelian",
        href: "/purchases/categories",
        icon: ListTree,
        status: "available",
      },
      {
        label: "Pembelian",
        href: "/purchases",
        icon: Truck,
        status: "available",
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        label: "Laporan",
        href: "/reports",
        icon: ChartColumn,
        status: "available",
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        label: "Pengguna",
        href: "/pengguna",
        icon: Users,
        status: "coming-soon",
      },
    ],
  },
];
