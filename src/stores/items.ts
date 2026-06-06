import { defineStore } from 'pinia';

import type { games } from 'src/types/filters';
import type { item, min_item } from 'src/types/item';
import type { shop_list } from 'src/types/shop';

export const itemsStore = defineStore('items', {
  state: () => ({
    selectedItem: {} as item | null,
    shops: [{ name: 'Default', items: [] }] as shop_list[],
    activeShop: 0,
    generating: false
  }),
  getters: {
    getSelectedItem: (state) => state.selectedItem,
    getShops: (state) => state.shops,
    getActiveShop: (state) => state.shops[state.activeShop],
    getGenerating: (state) => state.generating,
    getTotalCost: (state) => {
      let cost = 0;
      for (const item of state.shops[state.activeShop]!.items) {
        for (let i = 0; i < item.quantity; i++) {
          cost += item.price;
        }
      }
      return cost;
    }
  },
  actions: {
    setSelectedItem(newSelectedItem: item) {
      this.selectedItem = newSelectedItem;
    },
    removeSelectedItem() {
      this.selectedItem = null;
    },
    setShopList(newShopList: shop_list[]) {
      this.shops = newShopList;
    },
    clearShop() {
      this.shops[this.activeShop]!.items.splice(0, this.shops[this.activeShop]!.items.length);
    },
    clearItem(item: min_item) {
      const index = this.shops[this.activeShop]!.items.indexOf(item);
      this.shops[this.activeShop]!.items.splice(index, 1);
    },
    addToShop(item: min_item, index?: number) {
      if (index! >= 0) {
        item.quantity++;
        this.shops[this.activeShop]!.items.splice(index!, 1, item);
      } else {
        this.shops[this.activeShop]!.items.push(item);
      }
    },
    removeFromShop(index: number) {
      if (this.shops[this.activeShop]!.items[index]!.quantity > 1) {
        this.shops[this.activeShop]!.items[index]!.quantity--;
      } else {
        this.shops[this.activeShop]!.items.splice(index, 1);
      }
    },
    changeActiveShop(shopIndex: number) {
      if (shopIndex >= this.shops.length || shopIndex < 0) {
        this.activeShop = 0;
      } else {
        this.activeShop = shopIndex;
      }
    },
    addShop(shopName: string) {
      this.shops.push({ name: shopName, items: [] });
      this.activeShop = this.shops.length - 1;
    },
    removeShop() {
      this.shops.splice(this.activeShop, 1);
      this.activeShop = 0;
      if (this.shops.length <= 0) {
        this.shops = [{ name: 'Default', items: [] }];
      }
    },
    getShopIndex(shopName: string): number {
      return this.shops.map((shop) => shop.name).indexOf(shopName);
    },
    updateShop(shopName: string, newItems: min_item[]) {
      const shopIndex = this.getShopIndex(shopName);
      if (shopIndex >= 0) {
        this.shops[shopIndex]!.items = newItems;
      }
    },
    updateShops(newShops: shop_list[]) {
      this.shops = newShops;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    },
    getFormattedPrice(price: number, game: games) {
      // Starfinder
      if (game === 'sf') {
        return price / 10 + ' credits';
      }

      // Pathfinder
      if (price < 10) {
        return price + ' cp';
      } else if (price < 100) {
        price = price / 10;
        if (!Number.isInteger(price)) {
          const decimal = (price - Math.floor(price)).toFixed(1);
          const copper = Number.parseFloat(decimal) * 10;
          return Math.trunc(price) + ' sp, ' + copper + ' cp';
        }
        return price + ' sp';
      } else if (price >= 100) {
        price = price / 100;
        if (!Number.isInteger(price)) {
          let decimal = (price - Math.floor(price)).toFixed(2);
          let silver = Number.parseFloat(decimal) * 100;
          if (!Number.isInteger(silver / 10)) {
            silver = silver / 10;
            decimal = (silver - Math.floor(silver)).toFixed(1);
            const copper = Number.parseFloat(decimal) * 10;
            if (Math.trunc(silver) === 0) {
              return Math.trunc(price) + ' gp, ' + copper + ' cp';
            } else {
              return Math.trunc(price) + ' gp, ' + Math.trunc(silver) + ' sp, ' + copper + ' cp';
            }
          }
          return Math.trunc(price) + ' gp, ' + silver / 10 + ' sp';
        }
        return price + ' gp';
      }
    },
    getFormattedBulk(bulk: number) {
      switch (bulk) {
        case 0.1:
          return 'L';
        case 0:
          return '—';
        default:
          return bulk;
      }
    },
    getFormattedUsage(usage: string) {
      usage = usage.replaceAll('-', ' ');
      const worn = new RegExp(/(worn)([a-z]+)/).exec(usage);
      if (worn) {
        usage = usage.replace(worn[0], worn[1] + ' ' + worn[2]);
      }
      return usage;
    }
  }
});
