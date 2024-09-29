import { defineStore } from 'pinia';
import { capitalize } from 'lodash-es';
import type { party } from 'src/types/party';
import type { creature, min_creature } from 'src/types/creature';
import type { encounter, encounter_list } from 'src/types/encounter';
import type { roles, variants } from 'src/types/filters';
import type { item, min_item } from 'src/types/item';
import { shop_list } from 'src/types/shop';
import { template, template_data } from 'src/types/template';

export const settingsStore = defineStore('settings', {
  state: () => ({
    hidden_nav: true,
    experimental_features: false,
    is_creature_sheet_on: false,
    is_aon_links_on: false,
    pf_version: 'Any'
  }),
  getters: {
    getHiddenNav: (state) => state.hidden_nav,
    getExperimentalFeatures: (state) => state.experimental_features,
    getCreatureSheets: (state) => state.is_creature_sheet_on,
    getAonLinks: (state) => state.is_aon_links_on,
    getPfVersion: (state) => state.pf_version
  },
  actions: {
    setHiddenNav(newHiddenNav: boolean) {
      this.hidden_nav = newHiddenNav;
    },
    setExperimentalFeatures(newExperimentalFeatures: boolean) {
      this.experimental_features = newExperimentalFeatures;
    },
    setCreatureSheets(newCreatureSheets: boolean) {
      this.is_creature_sheet_on = newCreatureSheets;
    },
    setAonLinks(newAonLinks: boolean) {
      this.is_aon_links_on = newAonLinks;
    },
    setPfVersion(newPfVersion: string) {
      this.pf_version = newPfVersion;
    }
  }
});

export const partyStore = defineStore('party', {
  state: () => ({
    parties: [{ name: 'Default', members: [1, 1, 1, 1] }] as party[],
    activeParty: 0
  }),
  getters: {
    getParties: (state) => state.parties,
    getActive: (state) => state.activeParty,
    getActiveParty: (state) => state.parties[state.activeParty]
  },
  actions: {
    getPartyIndex(partyName: string): number {
      return this.parties.map((party) => party.name).indexOf(partyName);
    },
    updateParty(partyName: string, newMembers: number[]) {
      const partyIndex = this.getPartyIndex(partyName);
      if (partyIndex >= 0) {
        this.parties[partyIndex].members = newMembers;
      }
    },
    updateParties(newParties: party[]) {
      this.parties = newParties;
    },
    changeActiveParty(partyIndex: number) {
      if (partyIndex >= this.parties.length || partyIndex < 0) {
        this.activeParty = 0;
      } else {
        this.activeParty = partyIndex;
      }
    },
    addParty(partyName: string) {
      this.parties.push({ name: partyName, members: [1, 1, 1, 1] });
      this.activeParty = this.parties.length - 1;
    },
    removeParty() {
      this.parties.splice(this.activeParty, 1);
      this.activeParty = 0;
      if (this.parties.length <= 0) {
        this.parties = [{ name: 'Default', members: [1, 1, 1, 1] }];
      }
    }
  }
});

export const filtersStore = defineStore('filters', {
  state: () => ({
    creatureFilters: {
      traits: [] as string[],
      alignments: [] as string[],
      sizes: [] as string[],
      rarities: [] as string[],
      families: [] as string[],
      creature_types: [] as string[],
      sources: [] as string[],
      creature_roles: [] as string[]
    },
    itemFilters: {
      sources: [] as string[],
      traits: [{}] as { label: string; value: string }[]
    }
  }),
  getters: {
    getCreatureFilters: (state) => state.creatureFilters,
    getItemFilters: (state) => state.itemFilters
  },
  actions: {
    updateTraits(newTraits: string[]) {
      this.creatureFilters.traits = newTraits.map((trait) => {
        return capitalize(trait);
      });
    },
    updateAlignments(newAlignments: string[]) {
      this.creatureFilters.alignments = newAlignments;
    },
    updateSizes(newSizes: string[]) {
      newSizes.reverse();
      this.creatureFilters.sizes = newSizes;
    },
    updateRarities(newRarities: string[]) {
      this.creatureFilters.rarities = newRarities;
    },
    updateFamilies(newFamilies: string[]) {
      this.creatureFilters.families = newFamilies;
    },
    updateCreatureType(newCreatureType: string[]) {
      this.creatureFilters.creature_types = newCreatureType;
    },
    updateSources(newSources: string[]) {
      this.creatureFilters.sources = newSources;
    },
    updateRoles(newRoles: string[]) {
      this.creatureFilters.creature_roles = newRoles;
    },
    updateItemSources(newSources: string[]) {
      this.itemFilters.sources = newSources;
    },
    updateItemTraits(newTraits: string[]) {
      this.itemFilters.traits = newTraits.map((trait) => ({
        label: trait
          .split('-')
          .map((str) => capitalize(str))
          .join(' ')
          .replace('Additive', 'Additive '),
        value: trait
      }));
    }
  }
});

export const creaturesStore = defineStore('creatures', {
  state: () => ({ creatures: [] as creature[] }),
  getters: {
    getCreatures: (state) => state.creatures,
    getCreatureId: (state) => (id: number) =>
      state.creatures.find((creature) => creature.core_data.essential.id === id)
  },
  actions: {
    updateCreatures(newCreatures: creature[]) {
      // calculate the roles of the creature, by picking the percentages that are at least over 50%
      newCreatures.forEach((creature) => {
        const rolePercentages: { role: roles; percentage: number }[] = [
          { role: 'Brute', percentage: creature.core_data.derived.brute_percentage },
          {
            role: 'Magical Striker',
            percentage: creature.core_data.derived.magical_striker_percentage
          },
          {
            role: 'Skill Paragon',
            percentage: creature.core_data.derived.skill_paragon_percentage
          },
          { role: 'Skirmisher', percentage: creature.core_data.derived.skirmisher_percentage },
          { role: 'Sniper', percentage: creature.core_data.derived.sniper_percentage },
          { role: 'Soldier', percentage: creature.core_data.derived.soldier_percentage },
          { role: 'SpellCaster', percentage: creature.core_data.derived.spell_caster_percentage }
        ];
        const rolesList: roles[] = [];
        rolePercentages.forEach((role) => {
          if (role.percentage >= 50) {
            rolesList.push(role.role);
          }
        });
        if (rolePercentages.length > 0) {
          creature.core_data.derived.creature_role = rolesList;
        } else {
          creature.core_data.derived.creature_role = ['None'];
        }
      });
      this.creatures = newCreatures;
    }
  }
});

export const encounterStore = defineStore('encounter', {
  state: () => ({
    encounters: [{ name: 'Default', creatures: [] }] as encounter_list[],
    activeEncounter: 0,
    is_pwl_on: false,
    generating: false
  }),
  getters: {
    getEncounters: (state) => state.encounters,
    getActive: (state) => state.activeEncounter,
    getActiveEncounter: (state) => state.encounters[state.activeEncounter],
    getPwl: (state) => state.is_pwl_on,
    getGenerating: (state) => state.generating
  },
  actions: {
    clearEncounter() {
      this.encounters[this.activeEncounter].creatures.splice(
        0,
        this.encounters[this.activeEncounter].creatures.length
      );
    },
    clearCreature(creature: min_creature) {
      const index = this.encounters[this.activeEncounter].creatures.indexOf(creature);
      this.encounters[this.activeEncounter].creatures.splice(index, 1);
    },
    changeVariant(index: number, variant: variants) {
      this.encounters[this.activeEncounter].creatures[index].variant = variant;
    },
    addToEncounter(creature: min_creature, index?: number) {
      if (index! >= 0) {
        if (creature.quantity) {
          creature.quantity++;
        } else {
          creature.quantity = 1;
        }
        this.encounters[this.activeEncounter].creatures.splice(index!, 1, creature);
      } else {
        const newCreature = { ...creature };
        newCreature.quantity = 1;
        this.encounters[this.activeEncounter].creatures.push(newCreature);
      }
    },
    removeFromEncounter(index: number) {
      if (this.encounters[this.activeEncounter].creatures[index].quantity! > 1) {
        this.encounters[this.activeEncounter].creatures[index].quantity!--;
      } else {
        this.encounters[this.activeEncounter].creatures.splice(index, 1);
      }
    },
    changeActiveEncounter(encounterIndex: number) {
      if (encounterIndex >= this.encounters.length || encounterIndex < 0) {
        this.activeEncounter = 0;
      } else {
        this.activeEncounter = encounterIndex;
      }
    },
    addEncounter(encounterName: string) {
      this.encounters.push({ name: encounterName, creatures: [] });
      this.activeEncounter = this.encounters.length - 1;
    },
    removeEncounter() {
      this.encounters.splice(this.activeEncounter, 1);
      this.activeEncounter = 0;
      if (this.encounters.length <= 0) {
        this.encounters = [{ name: 'Default', creatures: [] }];
      }
    },
    getEncounterIndex(encounterName: string): number {
      return this.encounters.map((encounter) => encounter.name).indexOf(encounterName);
    },
    updateEncounter(encounterName: string, newCreatures: min_creature[]) {
      const encounterIndex = this.getEncounterIndex(encounterName);
      if (encounterIndex >= 0) {
        this.encounters[encounterIndex].creatures = newCreatures;
      }
    },
    updateEncounters(newEncounters: encounter_list[]) {
      this.encounters = newEncounters;
    },
    setPwL(newPwl: boolean) {
      this.is_pwl_on = newPwl;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    }
  }
});

export const infoStore = defineStore('info', {
  state: () => ({
    info: {
      experience: 0,
      challenge: 'Trivial',
      encounter_exp_levels: {
        Moderate: 0,
        Trivial: 0,
        Low: 0,
        Extreme: 0,
        Severe: 0,
        Impossible: 0
      },
      color: 'lime'
    } as encounter
  }),
  getters: {
    getInfo: (state) => state.info
  },
  actions: {
    setInfo(info: encounter) {
      this.info = info;
      switch (info.challenge) {
        case 'Trivial':
          this.info.color = 'lime';
          break;
        case 'Low':
          this.info.color = 'green';
          break;
        case 'Moderate':
          this.info.color = 'amber';
          break;
        case 'Severe':
          this.info.color = 'orange';
          break;
        case 'Extreme':
          this.info.color = 'red';
          break;
        case 'Impossible':
          this.info.color = 'purple-10';
          break;
        default:
          this.info.color = 'lime';
          break;
      }
    }
  }
});

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
      state.shops[state.activeShop].items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          cost += item.price;
        }
      });
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
      this.shops[this.activeShop].items.splice(0, this.shops[this.activeShop].items.length);
    },
    clearItem(item: min_item) {
      const index = this.shops[this.activeShop].items.indexOf(item);
      this.shops[this.activeShop].items.splice(index, 1);
    },
    addToShop(item: min_item, index?: number) {
      if (index! >= 0) {
        item.quantity++;
        this.shops[this.activeShop].items.splice(index!, 1, item);
      } else {
        this.shops[this.activeShop].items.push(item);
      }
    },
    removeFromShop(index: number) {
      if (this.shops[this.activeShop].items[index].quantity > 1) {
        this.shops[this.activeShop].items[index].quantity--;
      } else {
        this.shops[this.activeShop].items.splice(index, 1);
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
        this.shops[shopIndex].items = newItems;
      }
    },
    updateShops(newShops: shop_list[]) {
      this.shops = newShops;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    },
    getFormattedPrice(price: number) {
      if (price < 10) {
        return price + ' cp';
      } else if (price < 100) {
        price = price / 10;
        if (!Number.isInteger(price)) {
          const decimal = (price - Math.floor(price)).toFixed(1);
          const copper = parseFloat(decimal) * 10;
          return Math.trunc(price) + ' sp, ' + copper + ' cp';
        }
        return price + ' sp';
      } else if (price >= 100) {
        price = price / 100;
        if (!Number.isInteger(price)) {
          let decimal = (price - Math.floor(price)).toFixed(2);
          let silver = parseFloat(decimal) * 100;
          if (!Number.isInteger(silver / 10)) {
            silver = silver / 10;
            decimal = (silver - Math.floor(silver)).toFixed(1);
            const copper = parseFloat(decimal) * 10;
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
      const worn = RegExp(/(worn)([a-z]+)/).exec(usage);
      if (worn) {
        usage = usage.replace(worn[0], worn[1] + ' ' + worn[2]);
      }
      return usage;
    }
  }
});

export const templateStore = defineStore('template', {
  state: () => ({
    templates: [] as template[],
    activeTemplate: 0,
    defaultTemplates: 0
  }),
  getters: {
    getTemplates: (state) => state.templates,
    getActive: (state) => state.activeTemplate,
    getActiveTemplate: (state) => state.templates[state.activeTemplate]
  },
  actions: {
    getTemplateIndex(templateName: string): number {
      const index = this.templates.map((template) => template.name).indexOf(templateName);
      return index;
    },
    updateTemplate(oldName: string, newTemplate: template) {
      const templateIndex = this.getTemplateIndex(oldName);
      if (templateIndex >= this.defaultTemplates - 1) {
        this.templates[templateIndex] = newTemplate;
      }
    },
    updateTemplates(newTemplates: template[]) {
      this.templates = newTemplates;
    },
    changeActiveTemplate(templateIndex: number) {
      if (templateIndex >= this.templates.length || templateIndex < 0) {
        this.activeTemplate = 0;
      } else {
        this.activeTemplate = templateIndex;
      }
    },
    addDefaultTemplates(defaultTemplates: template_data[]) {
      const newTemplates: template[] = [];
      defaultTemplates.forEach((template) => {
        newTemplates.push({
          default: true,
          name: template.name,
          description: template.description,
          source_filter: [],
          trait_blacklist_filter: [],
          trait_whitelist_filter: [],
          rarity_filter: template.item_rarities,
          type_filter: template.item_types,
          armor_percentage: template.armor_percentage,
          equipment_percentage: template.equipment_percentage,
          shield_percentage: template.shield_percentage,
          weapon_percentage: template.weapon_percentage
        });
      });
      this.defaultTemplates = newTemplates.length;
      newTemplates.sort((a, b) => a.name.localeCompare(b.name));
      this.templates.forEach((template) => {
        newTemplates.push(template);
      });
      this.templates = newTemplates;
      this.changeActiveTemplate(this.getTemplateIndex('General'));
    },
    addTemplate(newTemplate: template) {
      this.templates.push(newTemplate);
      this.activeTemplate = this.templates.length - 1;
    },
    removeTemplate() {
      this.templates.splice(this.activeTemplate, 1);
      this.changeActiveTemplate(this.getTemplateIndex('General'));
    }
  }
});
