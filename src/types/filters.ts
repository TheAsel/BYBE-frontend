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

export type itemFilters = {
  name: string;
  level: { min: number; max: number };
  type: 'consumable' | 'equipment' | null;
  sort_by: 'id' | 'name' | 'level' | 'type';
  order_by: 'ascending' | 'descending';
};
