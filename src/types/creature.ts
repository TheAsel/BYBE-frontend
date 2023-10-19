export type creature = {
  id: number;
  name: string;
  level: number;
  hp: number;
  family: string;
  alignment: string;
  size: string;
  rarity: string;
  is_melee: boolean;
  is_ranged: boolean;
  is_spell_caster: boolean;
  sources: string[];
  archive_link: string;
  quantity?: number;
  variant?: 'weak' | 'base' | 'elite';
};
