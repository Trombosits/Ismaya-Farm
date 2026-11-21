/**
 * PLACEHOLDER database types.
 *
 * Only the tables currently wired to the backend are typed here. Once the
 * project is linked, regenerate the full types with:
 *
 *   pnpm db:types
 *
 * That command overwrites this file with the complete generated schema.
 * Keep it committed.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      livestock_species: {
        Row: {
          id: number;
          name: string;
          code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      livestock_breeds: {
        Row: {
          id: number;
          species_id: number;
          name: string;
          code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          species_id: number;
          name: string;
          code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          species_id?: number;
          name?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "livestock_breeds_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "livestock_species";
            referencedColumns: ["id"];
          },
        ];
      };
      livestock: {
        Row: {
          id: number;
          tag_code: string;
          species_id: number;
          breed_id: number | null;
          sex: "male" | "female";
          birth_date: string;
          acquisition_date: string;
          acquisition_type: "born" | "purchased" | "gift";
          status: "active" | "sold" | "dead" | "transferred";
          mother_id: number | null;
          father_id: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          tag_code: string;
          species_id: number;
          breed_id?: number | null;
          sex: "male" | "female";
          birth_date: string;
          acquisition_date: string;
          acquisition_type: "born" | "purchased" | "gift";
          status?: "active" | "sold" | "dead" | "transferred";
          mother_id?: number | null;
          father_id?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          tag_code?: string;
          species_id?: number;
          breed_id?: number | null;
          sex?: "male" | "female";
          birth_date?: string;
          acquisition_date?: string;
          acquisition_type?: "born" | "purchased" | "gift";
          status?: "active" | "sold" | "dead" | "transferred";
          mother_id?: number | null;
          father_id?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "livestock_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "livestock_species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "livestock_breed_id_fkey";
            columns: ["breed_id"];
            isOneToOne: false;
            referencedRelation: "livestock_breeds";
            referencedColumns: ["id"];
          },
        ];
      };
      livestock_health_records: {
        Row: {
          id: number;
          livestock_id: number;
          record_date: string;
          condition: string;
          diagnosis: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          livestock_id: number;
          record_date: string;
          condition: string;
          diagnosis?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          livestock_id?: number;
          record_date?: string;
          condition?: string;
          diagnosis?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "livestock_health_records_livestock_id_fkey";
            columns: ["livestock_id"];
            isOneToOne: false;
            referencedRelation: "livestock";
            referencedColumns: ["id"];
          },
        ];
      };
      livestock_batches: {
        Row: {
          id: number;
          batch_code: string;
          species_id: number;
          breed_id: number | null;
          quantity: number;
          acquisition_date: string;
          acquisition_type: "born" | "purchased" | "gift";
          status: "active" | "sold" | "dead" | "transferred";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          batch_code: string;
          species_id: number;
          breed_id?: number | null;
          quantity?: number;
          acquisition_date: string;
          acquisition_type: "born" | "purchased" | "gift";
          status?: "active" | "sold" | "dead" | "transferred";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          batch_code?: string;
          species_id?: number;
          breed_id?: number | null;
          quantity?: number;
          acquisition_date?: string;
          acquisition_type?: "born" | "purchased" | "gift";
          status?: "active" | "sold" | "dead" | "transferred";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "livestock_batches_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "livestock_species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "livestock_batches_breed_id_fkey";
            columns: ["breed_id"];
            isOneToOne: false;
            referencedRelation: "livestock_breeds";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          id: number;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          category_id: number;
          name: string;
          sku: string;
          unit: string;
          selling_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          category_id: number;
          name: string;
          sku: string;
          unit: string;
          selling_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          category_id?: number;
          name?: string;
          sku?: string;
          unit?: string;
          selling_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          id: number;
          invoice_number: string;
          sale_date: string;
          customer_name: string;
          customer_phone: string | null;
          total_amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          invoice_number: string;
          sale_date: string;
          customer_name: string;
          customer_phone?: string | null;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          invoice_number?: string;
          sale_date?: string;
          customer_name?: string;
          customer_phone?: string | null;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sale_item: {
        Row: {
          id: number;
          sale_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          id?: number;
          sale_id: number;
          product_id: number;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
        Update: {
          id?: number;
          sale_id?: number;
          product_id?: number;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sale_item_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_item_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_item_livestock: {
        Row: {
          id: number;
          sale_item_id: number;
          livestock_id: number;
        };
        Insert: {
          id?: number;
          sale_item_id: number;
          livestock_id: number;
        };
        Update: {
          id?: number;
          sale_item_id?: number;
          livestock_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sale_item_livestock_sale_item_id_fkey";
            columns: ["sale_item_id"];
            isOneToOne: false;
            referencedRelation: "sale_item";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_item_livestock_livestock_id_fkey";
            columns: ["livestock_id"];
            isOneToOne: false;
            referencedRelation: "livestock";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          id: number;
          name: string;
          phone: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_categories: {
        Row: {
          id: number;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: number;
          purchase_date: string;
          supplier: string;
          category_id: number;
          total_amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          purchase_date: string;
          supplier: string;
          category_id: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          purchase_date?: string;
          supplier?: string;
          category_id?: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "purchase_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_item: {
        Row: {
          id: number;
          purchase_id: number;
          item_name: string;
          quantity: number;
          unit: string;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          id?: number;
          purchase_id: number;
          item_name: string;
          quantity?: number;
          unit: string;
          unit_price?: number;
          subtotal?: number;
        };
        Update: {
          id?: number;
          purchase_id?: number;
          item_name?: string;
          quantity?: number;
          unit?: string;
          unit_price?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_item_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type PublicSchema = Database["public"];
