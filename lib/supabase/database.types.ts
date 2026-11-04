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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type PublicSchema = Database["public"];
