export type valid_genders = {
  ancestry: string;
  valid_genders: string[];
};

export type npc = {
  gender: string | undefined;
  ancestry: string | undefined;
  class: string | undefined;
  job: string | undefined;
  name: string | undefined;
  nickname: string | null;
};

export type npc_list = {
  name: string;
  npc: npc;
};
