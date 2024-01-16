export type creature = {
  id: number;
  sources: string[];
  archive_link: string;
  name: string;
  level: number;
  hp: number;
  traits: string[];
  alignment: string;
  size: string;
  rarity: string;
  family: string;
  creature_type: string;
  is_melee: boolean;
  is_ranged: boolean;
  is_spell_caster: boolean;
};

export type creature_encounter = {
  archive_link: string;
  name: string;
  level: number;
  quantity?: number;
  variant?: 'Weak' | 'Base' | 'Elite';
};
