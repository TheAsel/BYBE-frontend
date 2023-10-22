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
  creature_type: 'Monster' | 'NPC';
  is_melee: boolean;
  is_ranged: boolean;
  is_spell_caster: boolean;
  quantity?: number;
  variant?: 'weak' | 'base' | 'elite';
};
