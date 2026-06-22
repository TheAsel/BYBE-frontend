import type { creature } from "@/types/creature";
import type {
  alignments,
  challenges,
  complexities,
  games,
  rarities,
  roles,
  sizes,
  variants
} from "@/types/filters";
import type { hazard } from "@/types/hazard";

export type encounter = {
  experience: number;
  challenge: challenges;
  encounter_exp_levels: {
    Trivial: number;
    Low: number;
    Moderate: number;
    Severe: number;
    Extreme: number;
    Impossible: number;
  };
  color?: "lime" | "green" | "amber" | "orange" | "red" | "purple-10";
};

export type encounter_data = {
  challenge?: challenges;
  adventure_group?: adventure_groups;
  creature_percentage?: number;
  creature_data: {
    alignment_filter?: alignments[] | null;
    allow_elite_variants?: boolean | null;
    allow_weak_variants?: boolean | null;
    family_filter?: string[] | null;
    max_creatures?: number | null;
    min_creatures?: number | null;
    rarity_filter?: rarities[] | null;
    role_filter?: roles[] | null;
    role_lower_threshold?: number | null;
    role_upper_threshold?: number | null;
    size_filter?: sizes[] | null;
    source_filter?: string[] | null;
    trait_blacklist_filter?: string[] | null;
    trait_whitelist_filter?: string[] | null;
    type_filter?: string[] | null;
    is_pwl_on: boolean;
    game_system_version: string;
  };
  hazard_percentage?: number;
  hazard_data: {
    complexity_filter?: complexities[] | null;
    min_ac?: number | null;
    max_ac?: number | null;
    min_fortitude?: number | null;
    max_fortitude?: number | null;
    min_hardnes?: number | null;
    max_hardness?: number | null;
    min_hazards?: number | null;
    max_hazards?: number | null;
    min_reflex?: number | null;
    max_reflex?: number | null;
    min_stealth?: number | null;
    max_stealth?: number | null;
    min_will?: number | null;
    max_will?: number | null;
    size_filter?: sizes[] | null;
    source_filter?: string[] | null;
    rarity_filter?: rarities[] | null;
    trait_blacklist_filter?: string[] | null;
    trait_whitelist_filter?: string[] | null;
    game_system_version: string;
  };
  party_levels: number[];
};

export type random_encounter = {
  count: number;
  encounter_info: encounter;
  results?: {
    creatures: creature[];
    hazards: hazard[];
  };
};

export type min_creature_hazard =
  | {
      is_hazard: false;
      game: games;
      id: number;
      archive_link: string;
      name: string;
      level: number;
      variant: variants;
      quantity?: number;
    }
  | {
      is_hazard: true;
      game: games;
      id: number;
      archive_link: string;
      name: string;
      level: number;
      complexity: complexities;
      quantity?: number;
    };

export type encounter_list = {
  name: string;
  creatures: min_creature_hazard[];
};

export type encounter_info = {
  creatures_params: {
    enemy_levels: number[];
    is_pwl_on: boolean;
  };
  hazards_params: {
    hazards: {
      complexity: complexities;
      level: number;
    }[];
  };
  party_levels: number[];
};

export type adventure_groups =
  | "BossAndLackeys"
  | "BossAndLieutenant"
  | "EliteEnemies"
  | "LieutenantAndLackeys"
  | "MatedPair"
  | "Troop"
  | "MookSquad";

export type shareable_encounter = {
  encounter_name: string;
  creatures_data: {
    id: number;
    variant: variants;
    qty: number;
    game: games;
  }[];
  hazards_data: {
    id: number;
    qty: number;
    game: games;
  }[];
};
