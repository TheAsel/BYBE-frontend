import { defineStore } from "pinia";

import type { games } from "@/types/filters";
import type { item, min_item } from "@/types/item";
import type { shop_list } from "@/types/shop";

export const itemsStore = defineStore("items_store", {
  state: (): {
    selectedItem: item | null;
    shops: shop_list[];
    activeShop: number;
    generating: boolean;
  } => ({
    activeShop: 0,
    generating: false,
    selectedItem: null,
    shops: [{ items: [], name: "Default" }]
  }),
  getters: {
    getTotalCost: state => {
      let cost = 0;
      for (const item of state.shops[state.activeShop]!.items) {
        for (let i = 0; i < item.quantity; i += 1) {
          cost += item.price;
        }
      }
      return cost;
    }
  },
  actions: {
    addShop(shopName: string) {
      this.shops.push({ items: [], name: shopName });
      this.activeShop = this.shops.length - 1;
    },
    addToShop(item: min_item, index?: number) {
      if (index! >= 0) {
        item.quantity += 1;
        this.shops[this.activeShop]!.items.splice(index!, 1, item);
      } else {
        this.shops[this.activeShop]!.items.push(item);
      }
    },
    changeActiveShop(shopIndex: number) {
      if (shopIndex >= this.shops.length || shopIndex < 0) {
        this.activeShop = 0;
      } else {
        this.activeShop = shopIndex;
      }
    },
    clearItem(item: min_item) {
      const index = this.shops[this.activeShop]!.items.indexOf(item);
      this.shops[this.activeShop]!.items.splice(index, 1);
    },
    clearShop() {
      this.shops[this.activeShop]!.items.splice(0);
    },
    getFormattedBulk(bulk: number) {
      switch (bulk) {
        case 0.1: {
          return "L";
        }
        case 0: {
          return "—";
        }
        default: {
          return bulk;
        }
      }
    },
    getFormattedPrice(price: number, game: games) {
      switch (game) {
        case "sf": {
          return `${price / 10} credits`;
        }

        case "pf": {
          let newPrice = price;
          if (newPrice < 10) {
            return `${newPrice} cp`;
          } else if (newPrice < 100) {
            newPrice /= 10;
            if (!Number.isInteger(newPrice)) {
              const decimal = (newPrice - Math.floor(newPrice)).toFixed(1);
              const copper = Number.parseFloat(decimal) * 10;
              return `${Math.trunc(newPrice)} sp, ${copper} cp`;
            }
            return `${newPrice} sp`;
          } else if (newPrice >= 100) {
            newPrice /= 100;
            if (!Number.isInteger(newPrice)) {
              let decimal = (newPrice - Math.floor(newPrice)).toFixed(2);
              let silver = Number.parseFloat(decimal) * 100;
              if (!Number.isInteger(silver / 10)) {
                silver /= 10;
                decimal = (silver - Math.floor(silver)).toFixed(1);
                const copper = Number.parseFloat(decimal) * 10;
                if (Math.trunc(silver) === 0) {
                  return `${Math.trunc(newPrice)} gp, ${copper} cp`;
                }
                return `${Math.trunc(newPrice)} gp, ${Math.trunc(silver)} sp, ${
                  copper
                } cp`;
              }
              return `${Math.trunc(newPrice)} gp, ${silver / 10} sp`;
            }
            return `${newPrice} gp`;
          }
          break;
        }

        default:
          break;
      }
      return "";
    },
    getFormattedUsage(usage: string) {
      let newUsage = usage.replaceAll("-", " ");
      const worn = /(worn)([a-z]+)/u.exec(newUsage);
      if (worn) {
        newUsage = newUsage.replace(worn[0], `${worn[1]} ${worn[2]}`);
      }
      return newUsage;
    },
    getShopIndex(shopName: string): number {
      return this.shops.map(shop => shop.name).indexOf(shopName);
    },
    removeFromShop(index: number) {
      if (this.shops[this.activeShop]!.items[index]!.quantity > 1) {
        this.shops[this.activeShop]!.items[index]!.quantity -= 1;
      } else {
        this.shops[this.activeShop]!.items.splice(index, 1);
      }
    },
    removeSelectedItem() {
      this.selectedItem = null;
    },
    removeShop() {
      this.shops.splice(this.activeShop, 1);
      this.activeShop = 0;
      if (this.shops.length <= 0) {
        this.shops = [{ items: [], name: "Default" }];
      }
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    },
    setSelectedItem(newSelectedItem: item) {
      this.selectedItem = newSelectedItem;
    },
    setShopList(newShopList: shop_list[]) {
      this.shops = newShopList;
    },
    updateShop(shopName: string, newItems: min_item[]) {
      const shopIndex = this.getShopIndex(shopName);
      if (shopIndex >= 0) {
        this.shops[shopIndex]!.items = newItems;
      }
    },
    updateShops(newShops: shop_list[]) {
      this.shops = newShops;
    }
  }
});
