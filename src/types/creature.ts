export type creature = {
  aon_id: number;
  id: number;
  sources: string[];
  archive_link: string;
  name: string;
  base_level: number;
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
  variant?: 'Weak' | 'Base' | 'Elite';
  variant_archive_link: string;
  variant_level: number;
};

export type creature_encounter = {
  archive_link: string;
  name: string;
  level: number;
  quantity?: number;
  variant?: 'Weak' | 'Base' | 'Elite';
};
