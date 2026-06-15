import type { games, rarities, sizes } from "@/types/filters";

export type item = {
  game: games;
  armor_data?: {
    ac_bonus: number;
    check_penalty: number;
    dex_cap: number;
    id: number;
    n_of_potency_runes: number;
    n_of_resilient_runes: number;
    property_runes: string[];
    speed_penalty: number;
    strength_required: number;
  };
  core_item: {
    id: number;
    name: string;
    bulk: number;
    quantity: number;
    base_item: string | null;
    category: string | null;
    description: string;
    hardness: number;
    hp: number;
    level: number;
    price: number;
    usage: string | null;
    group: string | null;
    item_type: "Armor" | "Consumable" | "Equipment" | "Weapon" | "Shield";
    material_grade: string | null;
    material_type: string | null;
    number_of_uses: number | null;
    license: string;
    remaster: boolean;
    source: string;
    rarity: rarities;
    size: sizes;
    traits: { name: string; description: string | null }[];
  };
  shield_data?: {
    bonus_ac: number;
    id: number;
    n_of_reinforcing_runes: number;
    speed_penalty: number;
  };
  weapon_data?: {
    id: number;
    to_hit_bonus: number;
    damage_data: [
      {
        id: number;
        bonus_dmg: number;
        dmg_type: string | null;
        dice?: {
          n_of_dices: number;
          dice_size: number;
        };
      }
    ];
    n_of_potency_runes: number;
    n_of_striking_runes: number;
    property_runes: string[];
    range?: {
      id: number;
      value: string;
      increment: string | null;
      max: string | null;
    };
    reload: string;
    weapon_type: "Melee" | "Ranged" | "Generic";
    splash_dmg: number;
  };
};

export type item_response = {
  count: number;
  total: number;
  next: string;
  results: item[];
};

export type min_item = {
  game: games;
  id: number;
  archive_link: string;
  name: string;
  level: number;
  type: string;
  price: number;
  quantity: number;
};
