import type { rarities } from "@/types/filters";

export interface template {
  default: boolean;
  name: string;
  description?: string;
  source_filter: string[] | null;
  trait_blacklist_filter: string[] | null;
  trait_whitelist_filter: string[] | null;
  rarity_filter: string[] | null;
  type_filter: string[] | null;
  armor_percentage: number | null;
  equipment_percentage: number | null;
  shield_percentage: number | null;
  weapon_percentage: number | null;
}

export interface template_data {
  name: string;
  description: string;
  item_types?: string[];
  item_traits_whitelist: string[];
  item_traits_blacklist: string[];
  item_rarities?: rarities[];
  armor_percentage?: number;
  equipment_percentage?: number;
  shield_percentage?: number;
  weapon_percentage?: number;
}
