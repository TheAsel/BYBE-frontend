import type { complexities, games, rarities, sizes } from "@/types/filters";
import type { action, trait } from "@/types/generic";

export interface hazard {
  game: games;
  core_hazard: {
    actions: action[];
    essential: {
      ac: number;
      complexity: complexities;
      description: string;
      disable_description: string;
      fortitude: number;
      hardness: number;
      has_health: true;
      hp: number;
      id: number;
      level: number;
      license: string;
      name: string;
      rarity: rarities;
      reflex: number;
      remaster: true;
      reset_description: string;
      routine_description: string;
      size: sizes;
      source: string;
      stealth: number | null;
      stealth_detail: string;
      will: number;
    };
    game_system: games;
    traits: trait[];
  };
}

export interface hazard_response {
  count: number;
  total: number;
  next: string;
  results: hazard[];
}
