import { rarities } from './filters';

export type template = {
  default: boolean;
  name: string;
  description?: string;
  source_filter?: string[];
  trait_blacklist_filter?: string[];
  trait_whitelist_filter?: string[];
  rarity_filter?: string[];
  type_filter?: string[];
  armor_percentage?: number;
  equipment_percentage?: number;
  shield_percentage?: number;
  weapon_percentage?: number;
};

export type template_data = {
  name: string;
  description: string;
  item_types?: string[];
  item_rarities?: rarities[];
  armor_percentage?: number;
  equipment_percentage?: number;
  shield_percentage?: number;
  weapon_percentage?: number;
};
