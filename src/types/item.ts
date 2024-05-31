import { rarities, sizes } from './filters';

export type item = {
  core_item: {
    id: number;
    name: string;
    bulk: number;
    category: string;
    description: string;
    hardness: number;
    hp: number;
    level: number;
    price: number;
    usage: string;
    item_type: string;
    material_grade: string;
    material_type: string;
    number_of_uses: number;
    license: string;
    remaster: boolean;
    source: string;
    rarity: rarities;
    size: sizes;
    traits: string[];
  };
};

export type item_response = {
  count: number;
  total: number;
  next: string;
  results: item[];
};
