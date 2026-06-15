import type { complexities, games, rarities, sizes } from "@/types/filters";

export type hazard = {
  game: games;
  core_hazard: {
    actions: [
      {
        core_action: {
          action_type: string;
          category: string;
          description: string;
          id: number;
          license: string;
          n_of_actions: number;
          name: string;
          rarity: rarities;
          remaster: boolean;
          slug: string;
          source: string;
        };
        traits: { name: string; description: string | null }[];
      }
    ];
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
    traits: { name: string; description: string | null }[];
  };
};

export type hazard_response = {
  count: number;
  total: number;
  next: string;
  results: hazard[];
};
