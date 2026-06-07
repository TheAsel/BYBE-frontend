import { encounterStore } from 'src/stores/encounter';
import { itemsStore } from 'src/stores/items';
import { npcStore } from 'src/stores/npc';
import { partyStore } from 'src/stores/party';
import { settingsStore } from 'src/stores/settings';
import { templateStore } from 'src/stores/template';

import type { encounter_list } from 'src/types/encounter';
import type { npc_list } from 'src/types/npcs';
import type { party } from 'src/types/party';
import type { shop_list } from 'src/types/shop';
import type { template } from 'src/types/template';

export function updateLocalStorageParties() {
  const party = partyStore();
  const localParty = localStorage.getItem('parties');
  if (localParty) {
    try {
      const parsedParties = JSON.parse(localParty);
      if (Array.isArray(parsedParties)) {
        const isCompatible = parsedParties.every((p) => {
          return (
            typeof p.name === 'string' &&
            Array.isArray(p.members) &&
            p.members.every((member: undefined) => typeof member === 'number')
          );
        });
        if (isCompatible) {
          const parties: party[] = parsedParties;
          for (const party of parties) {
            if (!party || !party.members.every((player) => player >= 1 && player <= 20)) {
              throw new Error('Invalid saved party levels');
            }
          }
          const partyNames = parties.map((p) => p.name);
          if (new Set(partyNames).size !== partyNames.length) {
            throw new Error('Duplicate saved party names');
          }
          party.updateParties(parties);
        } else {
          throw new Error('Invalid saved party format');
        }
      } else {
        throw new TypeError('Invalid saved party format');
      }
    } catch (error) {
      console.error(error);
      const defaultParty = {
        name: 'Default',
        size: 4,
        level: 1,
        advanced: false,
        members: [1, 1, 1, 1]
      };
      localStorage.setItem('parties', JSON.stringify([defaultParty]));
      party.updateParties([defaultParty]);
    }
  }
}

export function updateLocalStorageEncounters() {
  const encounter = encounterStore();
  const localEncounters = localStorage.getItem('encounters');
  if (localEncounters) {
    try {
      const parsedEncounters = JSON.parse(localEncounters);
      if (Array.isArray(parsedEncounters)) {
        const isCompatible = parsedEncounters.every((p) => {
          return typeof p.name === 'string' && Array.isArray(p.creatures);
        });
        if (isCompatible) {
          const encounters: encounter_list[] = parsedEncounters;
          const encounterNames = encounters.map((p) => p.name);
          if (new Set(encounterNames).size !== encounterNames.length) {
            throw new Error('Duplicate saved encounter names');
          }
          encounter.updateEncounters(encounters);
        } else {
          throw new Error('Invalid saved encounter format');
        }
      } else {
        throw new TypeError('Invalid saved encounter format');
      }
    } catch (error) {
      console.error(error);
      const defaultEncounter = { name: 'Default', creatures: [] };
      localStorage.setItem('encounters', JSON.stringify([defaultEncounter]));
      encounter.updateEncounters([defaultEncounter]);
    }
  }
}

export function updateLocalStorageShops() {
  const items = itemsStore();
  const localShops = localStorage.getItem('shops');
  if (localShops) {
    try {
      const parsedShops = JSON.parse(localShops);
      if (Array.isArray(parsedShops)) {
        const isCompatible = parsedShops.every((p) => {
          return typeof p.name === 'string' && Array.isArray(p.items);
        });
        if (isCompatible) {
          const shops: shop_list[] = parsedShops;
          const shopNames = shops.map((p) => p.name);
          if (new Set(shopNames).size !== shopNames.length) {
            throw new Error('Duplicate saved shop names');
          }
          items.updateShops(shops);
        } else {
          throw new Error('Invalid saved shop format');
        }
      } else {
        throw new TypeError('Invalid saved shop format');
      }
    } catch (error) {
      console.error(error);
      const defaultShop = { name: 'Default', items: [] };
      localStorage.setItem('shops', JSON.stringify([defaultShop]));
      items.updateShops([defaultShop]);
    }
  }
}

export function updateLocalStorageTemplates() {
  const template = templateStore();
  const localTemplates = localStorage.getItem('templates');
  if (localTemplates) {
    try {
      const parsedTemplates = JSON.parse(localTemplates);
      if (Array.isArray(parsedTemplates)) {
        const isCompatible = parsedTemplates.every((p) => {
          return typeof p.name === 'string' && typeof p.default === 'boolean';
        });
        if (isCompatible) {
          const templates: template[] = parsedTemplates;
          const templateNames = templates.map((p) => p.name);
          if (new Set(templateNames).size !== templateNames.length) {
            throw new Error('Duplicate saved template names');
          }
          for (const template of templates) {
            template.default = false;
          }
          template.updateTemplates(templates);
        } else {
          throw new Error('Invalid saved template format');
        }
      } else {
        throw new TypeError('Invalid saved template format');
      }
    } catch (error) {
      console.error(error);
      localStorage.setItem('shops', JSON.stringify([]));
      template.updateTemplates([]);
    }
  }
}

export function updateLocalStorageNpcs() {
  const npcs = npcStore();
  const settings = settingsStore();

  const localNpcs = localStorage.getItem('npcs');
  if (localNpcs) {
    try {
      const parsedNpcs = JSON.parse(localNpcs);
      if (Array.isArray(parsedNpcs)) {
        const isCompatible = parsedNpcs.every((p) => {
          return typeof p.name === 'string';
        });
        if (isCompatible) {
          const npcList: npc_list[] = parsedNpcs;
          const npcNames = npcList.map((p) => p.name);
          if (new Set(npcNames).size !== npcNames.length) {
            throw new Error('Duplicate saved npc names');
          }
          npcs.updateNpcs(npcList);
        } else {
          throw new Error('Invalid saved npc format');
        }
      } else {
        throw new TypeError('Invalid saved npc format');
      }
    } catch (error) {
      console.error(error);
      const defaultNpc: npc_list = {
        name: 'Default',
        npc: {
          level: 0,
          gender: '',
          ancestry: '',
          culture: '',
          class: '',
          job: '',
          name: '',
          nickname: '',
          languages: '',
          description: '',
          personality: '',
          quirk: '',
          relationships: '',
          ideology: '',
          custom_fields: [{ name: '', body: '' }],
          game: settings.game
        },
        culture: false
      };
      localStorage.setItem('npcs', JSON.stringify([defaultNpc]));
      npcs.updateNpcs([defaultNpc]);
    }
  }
}
