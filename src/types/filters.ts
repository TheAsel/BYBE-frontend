export type alignments =
  | 'Any'
  | 'CE'
  | 'CN'
  | 'CG'
  | 'NE'
  | 'N'
  | 'NG'
  | 'LE'
  | 'LN'
  | 'LG'
  | 'No Alignment';

export type sizes = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type rarities = 'Common' | 'Uncommon' | 'Rare' | 'Unique';

export type challenges = 'Trivial' | 'Low' | 'Moderate' | 'Severe' | 'Extreme' | 'Impossible';

export type roles =
  | 'None'
  | 'Brute'
  | 'Magical Striker'
  | 'Skill Paragon'
  | 'Skirmisher'
  | 'Sniper'
  | 'Soldier'
  | 'SpellCaster';

export type variants = 'Weak' | 'Base' | 'Elite';

export type item_columns = 'id' | 'name' | 'level' | 'rarity' | 'type' | 'source';

export type item_filters = {
  name: string;
  level: { min: number; max: number };
  rarity: rarities | null;
  type: 'consumable' | 'equipment' | null;
  source: string;
  sort_by: item_columns;
  order_by: 'ascending' | 'descending';
};
