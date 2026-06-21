import type { rarities } from "@/types/filters";

export interface range {
  id: number;
  increment: string | null;
  max: string | null;
  value: string;
}

export interface trait {
  name: string;
  description: string | null;
  display_name: string | null;
}

export interface action {
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
}
