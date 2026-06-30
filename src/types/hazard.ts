import type { complexities, games, rarities, sizes } from "@/types/filters";
import type {
  action,
  resistance,
  trait,
  weakness,
  weapon
} from "@/types/generic";

export type hazard = {
  game: games;
  core_hazard: {
    actions: action[];
    essential: {
      ac: number | null;
      complexity: complexities;
      description: string;
      disable_description: string;
      fortitude: number | null;
      hardness: number;
      has_health: true;
      hp: number | null;
      hp_details: string | null;
      id: number;
      level: number;
      license: string;
      name: string;
      rarity: rarities;
      reflex: number | null;
      remaster: true;
      reset_description: string;
      routine_description: string;
      size: sizes;
      source: string;
      stealth: number | null;
      stealth_detail: string;
      will: number | null;
    };
    immunities: string[];
    resistances: resistance[];
    weaknesses: weakness[];
    weapons: weapon[];
    game_system: games;
    traits: trait[];
  };
};

export type hazard_response = {
  count: number;
  total: number;
  next: string;
  results: hazard[];
};
