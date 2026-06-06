import type { games } from 'src/types/filters';
import type { min_item } from 'src/types/item';

export type shop_list = {
  name: string;
  items: min_item[];
};

export type shareable_shop = {
  shop_name: string;
  items_data: {
    id: number;
    qty: number;
    game: games;
  }[];
};
