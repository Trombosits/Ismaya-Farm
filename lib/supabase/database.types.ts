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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type PublicSchema = Database["public"];
