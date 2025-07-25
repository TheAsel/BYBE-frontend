export type valid_genders = {
  ancestry: string;
  valid_genders: string[];
};

export type npc = {
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
};

export type npc_list = {
  name: string;
  npc: npc;
  culture: boolean;
};
