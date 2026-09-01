import type { rarities } from "@/types/filters";
import type { item_type } from "@/types/item";

export type template_data = {
  name: string;
  description: string;
  item_rarities: rarities[];
  item_traits_blacklist: string[];
  item_traits_whitelist: string[];
  item_types: item_type[];
  consumable_percentages: {
    ammunition_percentage: number | null;
    generic_percentage: number | null;
  };
  equippable_percentages: {
    armor_percentage: number | null;
    backpack_percentage: number | null;
    equipment_percentage: number | null;
    shield_percentage: number | null;
    treasure_percentage: number | null;
    weapon_percentage: number | null;
  };
};

export type template = template_data & {
  default: boolean;
  item_sources: string[];
};
