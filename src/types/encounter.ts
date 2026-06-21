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

export interface encounter {
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
}

export interface encounter_data {
  challenge?: challenges;
  adventure_group?: adventure_groups;
  creature_percentage?: number;
  creature_data: {
    trait_whitelist_filter: string[] | undefined;
    alignment_filter: alignments[] | undefined;
    size_filter: sizes[] | undefined;
    rarity_filter: rarities[] | undefined;
    family_filter: string[] | undefined;
    type_filter: string[] | undefined;
    source_filter: string[] | undefined;
    party_levels: number[];
    min_creatures?: number;
    max_creatures?: number;
    allow_weak_variants: boolean;
    allow_elite_variants: boolean;
    role_filter: roles[] | undefined;
    is_pwl_on: boolean;
    game_system_version: string;
  };
  hazard_percentage?: number;
  hazard_data: {
    trait_whitelist_filter: string[] | undefined;
    complexity_filter: complexities[] | undefined;
    size_filter: sizes[] | undefined;
    rarity_filter: rarities[] | undefined;
    source_filter: string[] | undefined;
    min_stealth?: number;
    max_stealth?: number;
    min_ac?: number;
    max_ac?: number;
    min_fortitude?: number;
    max_fortitude?: number;
    min_reflex?: number;
    max_reflex?: number;
    min_will?: number;
    max_will?: number;
    min_hardnes?: number;
    max_hardness?: number;
    min_hazards?: number;
    max_hazards?: number;
    game_system_version: string;
  };
  party_levels: number[];
}

export interface random_encounter {
  count: number;
  encounter_info: encounter;
  results?: {
    creatures: creature[];
    hazards: hazard[];
  };
}

export interface min_creature_hazard {
  game: games;
  id: number;
  archive_link: string;
  name: string;
  level: number;
  quantity?: number;
  variant?: variants | undefined;
  complexity?: complexities;
  is_hazard: boolean;
}

export interface encounter_list {
  name: string;
  creatures: min_creature_hazard[];
}

export interface encounter_info {
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
}

export type adventure_groups =
  | "BossAndLackeys"
  | "BossAndLieutenant"
  | "EliteEnemies"
  | "LieutenantAndLackeys"
  | "MatedPair"
  | "Troop"
  | "MookSquad";

export interface shareable_encounter {
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
}
