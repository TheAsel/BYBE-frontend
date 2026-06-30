import type { rarities } from "@/types/filters";
import type { item } from "@/types/item";

export type range = {
  id: number;
  increment: string | null;
  max: string | null;
  value: string;
};

export type trait = {
  name: string;
  description: string | null;
  display_name: string | null;
};

export type action = {
  core_action: {
    action_type: string;
    category: string;
    description: string;
    id: number;
    license: string;
    n_of_actions: number | null;
    name: string;
    rarity: rarities;
    remaster: boolean;
    slug: string;
    source: string;
  };
  traits: trait[];
};

export type weapon = {
  item_core: item["core_item"];
  weapon_data: item["weapon_data"];
};

export type resistance = {
  core: {
    id: number;
    name: string;
    value: number;
  };
  double_vs: string[];
  exception_vs: string[];
};

export type weakness = {
  id: number;
  name: string;
  value: number;
};
