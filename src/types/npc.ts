import type { games } from "@/types/filters";

export type valid_genders = {
  ancestry: string;
  valid_genders: string[];
};

export type npc = {
  level: number;
  gender: string;
  ancestry: string;
  culture: string;
  class: string;
  job: string;
  name: string;
  nickname: string | null;
  languages: string | null;
  description: string | null;
  personality: string | null;
  quirk: string | null;
  relationships: string | null;
  ideology: string | null;
  custom_fields: {
    name: string | null;
    body: string | null;
  }[];
  game: games;
};

export type npc_list = {
  name: string;
  npc: npc;
  culture: boolean;
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
