import type { games } from "@/types/filters";

export type valid_genders = {
  ancestry: string;
  valid_genders: string[];
};

export type npc = {
  name: string;
  nickname: string | null;
  gender: string;
  ancestry: string;
  culture: string;
  class: string;
  job: string;
  level: number;
  languages: string;
  quirk: string;
  description: string;
  personality: string;
  relationships: string;
  ideology: string;
  custom_fields: {
    name: string;
    body: string;
  }[];
  game: games;
};

export type npc_list = {
  name: string;
  has_culture: boolean;
  core_npc: npc;
};

export type shareable_npc = {
  list_name: string;
  npcs_data: {
    name: string;
    nickname?: string;
    gender: string;
    ancestry: string;
    job: string;
    level: number;
    culture: string;
    class: string;
    game: games;
  }[];
};

export type npc_data = {
  gender_filter?: string[];
  name_origin_filter?: {
    FromAncestry?: string[];
    FromCulture?: string[];
  };
  class_filter?: string[];
  job_filter?: string[];
  level_filter?: {
    min_level: number;
    max_level: number;
  };
  generate_nickname: boolean;
};
