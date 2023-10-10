export type creature = {
  id: number;
  name: string;
  level: number;
  hp: number;
  family: string;
  alignment: string;
  size: string;
  rarity: string;
  quantity?: number;
  variant?: 'weak' | 'base' | 'elite';
};
