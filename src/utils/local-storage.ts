import { encounterStore } from "@/stores/encounter";
import { itemsStore } from "@/stores/items";
import { npcStore } from "@/stores/npc";
import { partyStore } from "@/stores/party";
import { settingsStore } from "@/stores/settings";
import { templateStore } from "@/stores/template";

import type { encounter_list } from "@/types/encounter";
import type { npc_list } from "@/types/npc";
import type { shop_list } from "@/types/shop";
import type { template } from "@/types/template";

export function validateParties(parties: string): {
  valid: boolean;
  result: string;
} {
  try {
    const parsedParties = JSON.parse(parties);

    for (const party of parsedParties) {
      if (typeof party !== "object" || party === null)
        throw new Error("Invalid saved party");
      if (typeof party.advanced !== "boolean")
        throw new Error("Invalid saved party advanced");
      if (typeof party.name !== "string")
        throw new Error("Invalid saved party name");
      if (typeof party.level !== "number")
        throw new Error("Invalid saved party level");
      if (typeof party.size !== "number")
        throw new Error("Invalid saved party size");

      if (!Array.isArray(party.members))
        throw new Error("Invalid saved party members");

      // Legacy format: number[]
      if (party.members.every((level: unknown) => typeof level === "number")) {
        party.members = party.members.map((level: number, index: number) => ({
          name: `Player ${index + 1}`,
          level
        }));
      }

      for (const member of party.members) {
        if (typeof member !== "object" || member === null)
          throw new Error("Invalid saved party member");
        if (typeof member.name !== "string")
          throw new Error("Invalid saved party member name");
        if (typeof member.level !== "number")
          throw new Error("Invalid saved party member level");
      }
    }

    return { valid: true, result: JSON.stringify(parsedParties) };
  } catch (error) {
    console.error(error);
    const defaultParty = {
      advanced: false,
      name: "Default",
      level: 1,
      size: 4,
      members: [
        { level: 1, name: "Player 1" },
        { level: 1, name: "Player 2" },
        { level: 1, name: "Player 3" },
        { level: 1, name: "Player 4" }
      ]
    };
    return { valid: false, result: JSON.stringify(defaultParty) };
  }
}

export function updateLocalStorageParties(): void {
  const party_store = partyStore();
  const localParty = localStorage.getItem("parties");
  if (localParty !== null) {
    const validatedParties = validateParties(localParty);
    party_store.updateParties(JSON.parse(validatedParties.result));
    localStorage.setItem("parties", validatedParties.result);
  }
}

export function updateLocalStorageEncounters(): void {
  const encounter_store = encounterStore();
  const localEncounters = localStorage.getItem("encounters");
  if (localEncounters !== null) {
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

export function updateLocalStorageShops(): void {
  const items_store = itemsStore();
  const localShops = localStorage.getItem("shops");
  if (localShops !== null) {
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

export function updateLocalStorageTemplates(): void {
  const template_store = templateStore();
  const localTemplates = localStorage.getItem("templates");
  if (localTemplates !== null) {
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

export function updateLocalStorageNpcs(): void {
  const npc_store = npcStore();
  const settings_store = settingsStore();

  const localNpcs = localStorage.getItem("npcs");
  if (localNpcs !== null) {
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
