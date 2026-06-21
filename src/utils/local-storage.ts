import { encounterStore } from "@/stores/encounter";
import { itemsStore } from "@/stores/items";
import { npcStore } from "@/stores/npc";
import { partyStore } from "@/stores/party";
import { settingsStore } from "@/stores/settings";
import { templateStore } from "@/stores/template";

import type { encounter_list } from "@/types/encounter";
import type { npc_list } from "@/types/npcs";
import type { party } from "@/types/party";
import type { shop_list } from "@/types/shop";
import type { template } from "@/types/template";

export function updateLocalStorageParties() {
  const party_store = partyStore();
  const localParty = localStorage.getItem("parties");
  if (localParty) {
    try {
      const parsedParties = JSON.parse(localParty);
      if (Array.isArray(parsedParties)) {
        const isCompatible = parsedParties.every(
          p =>
            typeof p.name === "string" &&
            Array.isArray(p.members) &&
            p.members.every((member: undefined) => typeof member === "number")
        );
        if (isCompatible) {
          const parties: party[] = parsedParties;
          for (const party of parties) {
            if (!party?.members.every(player => player >= 1 && player <= 20)) {
              throw new Error("Invalid saved party levels");
            }
          }
          const partyNames = parties.map(p => p.name);
          if (new Set(partyNames).size !== partyNames.length) {
            throw new Error("Duplicate saved party names");
          }
          party_store.updateParties(parties);
        } else {
          throw new Error("Invalid saved party format");
        }
      } else {
        throw new TypeError("Invalid saved party format");
      }
    } catch (error) {
      console.error(error);
      const defaultParty = {
        advanced: false,
        level: 1,
        members: [1, 1, 1, 1],
        name: "Default",
        size: 4
      };
      localStorage.setItem("parties", JSON.stringify([defaultParty]));
      party_store.updateParties([defaultParty]);
    }
  }
}

export function updateLocalStorageEncounters() {
  const encounter_store = encounterStore();
  const localEncounters = localStorage.getItem("encounters");
  if (localEncounters) {
    try {
      const parsedEncounters = JSON.parse(localEncounters);
      if (Array.isArray(parsedEncounters)) {
        const isCompatible = parsedEncounters.every(
          p => typeof p.name === "string" && Array.isArray(p.creatures)
        );
        if (isCompatible) {
          const encounters: encounter_list[] = parsedEncounters;
          const encounterNames = encounters.map(p => p.name);
          if (new Set(encounterNames).size !== encounterNames.length) {
            throw new Error("Duplicate saved encounter names");
          }
          encounter_store.updateEncounters(encounters);
        } else {
          throw new Error("Invalid saved encounter format");
        }
      } else {
        throw new TypeError("Invalid saved encounter format");
      }
    } catch (error) {
      console.error(error);
      const defaultEncounter = { creatures: [], name: "Default" };
      localStorage.setItem("encounters", JSON.stringify([defaultEncounter]));
      encounter_store.updateEncounters([defaultEncounter]);
    }
  }
}

export function updateLocalStorageShops() {
  const items_store = itemsStore();
  const localShops = localStorage.getItem("shops");
  if (localShops) {
    try {
      const parsedShops = JSON.parse(localShops);
      if (Array.isArray(parsedShops)) {
        const isCompatible = parsedShops.every(
          p => typeof p.name === "string" && Array.isArray(p.items)
        );
        if (isCompatible) {
          const shops: shop_list[] = parsedShops;
          const shopNames = shops.map(p => p.name);
          if (new Set(shopNames).size !== shopNames.length) {
            throw new Error("Duplicate saved shop names");
          }
          items_store.updateShops(shops);
        } else {
          throw new Error("Invalid saved shop format");
        }
      } else {
        throw new TypeError("Invalid saved shop format");
      }
    } catch (error) {
      console.error(error);
      const defaultShop = { items: [], name: "Default" };
      localStorage.setItem("shops", JSON.stringify([defaultShop]));
      items_store.updateShops([defaultShop]);
    }
  }
}

export function updateLocalStorageTemplates() {
  const template_store = templateStore();
  const localTemplates = localStorage.getItem("templates");
  if (localTemplates) {
    try {
      const parsedTemplates = JSON.parse(localTemplates);
      if (Array.isArray(parsedTemplates)) {
        const isCompatible = parsedTemplates.every(
          p => typeof p.name === "string" && typeof p.default === "boolean"
        );
        if (isCompatible) {
          const templates: template[] = parsedTemplates;
          const templateNames = templates.map(p => p.name);
          if (new Set(templateNames).size !== templateNames.length) {
            throw new Error("Duplicate saved template names");
          }
          for (const template of templates) {
            template.default = false;
          }
          template_store.updateTemplates(templates);
        } else {
          throw new Error("Invalid saved template format");
        }
      } else {
        throw new TypeError("Invalid saved template format");
      }
    } catch (error) {
      console.error(error);
      localStorage.setItem("shops", JSON.stringify([]));
      template_store.updateTemplates([]);
    }
  }
}

export function updateLocalStorageNpcs() {
  const npc_store = npcStore();
  const settings_store = settingsStore();

  const localNpcs = localStorage.getItem("npcs");
  if (localNpcs) {
    try {
      const parsedNpcs = JSON.parse(localNpcs);
      if (Array.isArray(parsedNpcs)) {
        const isCompatible = parsedNpcs.every(p => typeof p.name === "string");
        if (isCompatible) {
          const npcList: npc_list[] = parsedNpcs;
          const npcNames = npcList.map(p => p.name);
          if (new Set(npcNames).size !== npcNames.length) {
            throw new Error("Duplicate saved npc names");
          }
          npc_store.updateNpcs(npcList);
        } else {
          throw new Error("Invalid saved npc format");
        }
      } else {
        throw new TypeError("Invalid saved npc format");
      }
    } catch (error) {
      console.error(error);
      const defaultNpc: npc_list = {
        culture: false,
        name: "Default",
        npc: {
          ancestry: "",
          class: "",
          culture: "",
          custom_fields: [{ body: "", name: "" }],
          description: "",
          game: settings_store.game,
          gender: "",
          ideology: "",
          job: "",
          languages: "",
          level: 0,
          name: "",
          nickname: "",
          personality: "",
          quirk: "",
          relationships: ""
        }
      };
      localStorage.setItem("npcs", JSON.stringify([defaultNpc]));
      npc_store.updateNpcs([defaultNpc]);
    }
  }
}
