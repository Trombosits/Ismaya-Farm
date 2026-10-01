import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Boxes,
  Dna,
  Egg,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  Package,
  PawPrint,
  Receipt,
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
    items: [
      {
        label: "Ringkasan",
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
        href: "/data-ternak",
        icon: PawPrint,
        status: "coming-soon",
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
        href: "/riwayat-kesehatan",
        icon: HeartPulse,
        status: "coming-soon",
      },
    ],
  },
  {
    label: "Reproduksi",
    items: [
      {
        label: "Perkawinan",
        href: "/perkawinan",
        icon: HeartHandshake,
        status: "coming-soon",
      },
      {
        label: "Kelahiran",
        href: "/kelahiran",
        icon: Baby,
        status: "coming-soon",
      },
    ],
  },
  {
    label: "Pakan",
    items: [
      {
        label: "Jenis Pakan",
        href: "/jenis-pakan",
        icon: Wheat,
        status: "coming-soon",
      },
      {
        label: "Pembelian Pakan",
        href: "/pembelian-pakan",
        icon: ShoppingCart,
        status: "coming-soon",
      },
      {
        label: "Stok Pakan",
        href: "/stok-pakan",
        icon: Boxes,
        status: "coming-soon",
      },
    ],
  },
  {
    label: "Penetasan",
    items: [
      {
        label: "Pengumpulan Telur",
        href: "/pengumpulan-telur",
        icon: Egg,
        status: "coming-soon",
      },
      {
        label: "Batch Penetasan",
        href: "/batch-penetasan",
        icon: Thermometer,
        status: "coming-soon",
      },
    ],
  },
  {
    label: "Produk & Penjualan",
    items: [
      {
        label: "Produk",
        href: "/produk",
        icon: Package,
        status: "coming-soon",
      },
      {
        label: "Penjualan",
        href: "/penjualan",
        icon: Receipt,
        status: "coming-soon",
      },
    ],
  },
  {
    label: "Pembelian",
    items: [
      {
        label: "Pembelian",
        href: "/pembelian",
        icon: Truck,
        status: "coming-soon",
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
