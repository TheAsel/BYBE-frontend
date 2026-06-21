import type { games } from "@/types/filters";

export interface valid_genders {
  ancestry: string;
  valid_genders: string[];
}

export interface npc {
  level: number | undefined;
  gender: string | undefined;
  ancestry: string | undefined;
  culture: string | undefined;
  class: string | undefined;
  job: string | undefined;
  name: string | undefined;
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
}

export interface npc_list {
  name: string;
  npc: npc;
  culture: boolean;
}

export interface shareable_npc {
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
}
