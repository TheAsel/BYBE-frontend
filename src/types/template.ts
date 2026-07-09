import type { rarities } from "@/types/filters";
import type { item_type } from "@/types/item";

export type template_data = {
  name: string;
  description: string;
  default: boolean;
  item_sources: string[];
  item_rarities: rarities[];
  item_traits_blacklist: string[];
  item_traits_whitelist: string[];
  item_types: item_type[];
  armor_percentage: number;
  equipment_percentage: number;
  shield_percentage: number;
  weapon_percentage: number;
};

export type template = template_data & {
  default: boolean;
  item_sources: string[];
};
