import type { games } from 'src/types/filters';
import type { min_item } from 'src/types/item';

export type shop_list = {
  name: string;
  items: min_item[];
};

export type shareable_shop = {
  shop_name: string;
  items_data: {
    id: number;
    qty: number;
    game: games;
  }[];
};

export type shop_data = {
  source_filter: string[] | null;
  trait_blacklist_filter: string[] | null;
  trait_whitelist_filter: string[] | null;
  rarity_filter: string[] | null;
  type_filter: string[] | null;
  armor_percentage: number | null;
  equipment_percentage: number | null;
  shield_percentage: number | null;
  weapon_percentage: number | null;
  consumable_dices: {
    dice_size: number | null;
    n_of_dices: number | null;
  }[];
  equippable_dices: {
    dice_size: number | null;
    n_of_dices: number | null;
  }[];
  min_level: number;
  max_level: number;
  shop_template?: string;
  game_system_version: string;
};
