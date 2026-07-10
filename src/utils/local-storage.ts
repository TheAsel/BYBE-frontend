import { encounterStore } from "@/stores/encounter";
import { itemsStore } from "@/stores/items";
import { npcStore } from "@/stores/npc";
import { partyStore } from "@/stores/party";
import { templateStore } from "@/stores/template";
import { encounter_list } from "@/types/encounter";

import type { npc_list } from "@/types/npc";
import type { party } from "@/types/party";
import type { shop_list } from "@/types/shop";

export function validateParties(parties: string): boolean {
  const party_store = partyStore();
  try {
    const parsedParties = JSON.parse(parties);

    if (!Array.isArray(parsedParties))
      throw new Error("Invalid saved parties format");

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

    const partyNames = parsedParties.map(party => party.name);
    if (new Set(partyNames).size !== partyNames.length) {
      throw new Error("Duplicate saved party names");
    }

    party_store.updateParties(parsedParties);
    localStorage.setItem("parties", JSON.stringify(parsedParties));
    return true;
  } catch (error) {
    console.error(error);
    const defaultParty: party[] = [
      {
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
      }
    ];
    party_store.updateParties(defaultParty);
    return false;
  }
}

export function validateEncounters(encounters: string): boolean {
  const encounter_store = encounterStore();
  try {
    const parsedEncounters = JSON.parse(encounters);

    if (!Array.isArray(parsedEncounters))
      throw new Error("Invalid saved encounters format");

    for (const encounter of parsedEncounters) {
      if (typeof encounter !== "object" || encounter === null)
        throw new Error("Invalid saved encounter");
      if (typeof encounter.name !== "string")
        throw new Error("Invalid saved encounter name");

      if (!Array.isArray(encounter.creatures))
        throw new Error("Invalid saved encounter creatures");

      for (const creature of encounter.creatures) {
        if (typeof creature !== "object" || creature === null)
          throw new Error("Invalid saved encounter creature");
        if (typeof creature.id !== "number")
          throw new Error("Invalid saved encounter creature id");
        if (typeof creature.name !== "string")
          throw new Error("Invalid saved encounter creature name");
        if (typeof creature.level !== "number")
          throw new Error("Invalid saved encounter creature level");
        if (typeof creature.game !== "string")
          throw new Error("Invalid saved encounter creature game");
        if (
          typeof creature.archive_link !== "string" &&
          creature.archive_link !== null
        )
          throw new Error("Invalid saved encounter creature link");
        if (typeof creature.quantity !== "number")
          throw new Error("Invalid saved encounter creature quantity");
        if (typeof creature.is_hazard !== "boolean")
          throw new Error("Invalid saved encounter creature is_hazard");
        if (creature.is_hazard && typeof creature.complexity !== "string")
          throw new Error("Invalid saved encounter creature complexity");
        if (!creature.is_hazard && typeof creature.variant !== "string")
          throw new Error("Invalid saved encounter creature variant");
      }
    }

    const encounterNames = parsedEncounters.map(encounter => encounter.name);
    if (new Set(encounterNames).size !== encounterNames.length) {
      throw new Error("Duplicate saved encounter names");
    }

    encounter_store.updateEncounters(parsedEncounters);
    localStorage.setItem("encounters", JSON.stringify(parsedEncounters));
    return true;
  } catch (error) {
    console.error(error);
    const defaultEncounter: encounter_list[] = [
      { creatures: [], name: "Default" }
    ];
    encounter_store.updateEncounters(defaultEncounter);
    return false;
  }
}

export function validateShops(shops: string): boolean {
  const item_store = itemsStore();
  try {
    const parsedShops = JSON.parse(shops);

    if (!Array.isArray(parsedShops))
      throw new Error("Invalid saved shops format");

    for (const shop of parsedShops) {
      if (typeof shop !== "object" || shop === null)
        throw new Error("Invalid saved shop");
      if (typeof shop.name !== "string")
        throw new Error("Invalid saved shop name");

      if (!Array.isArray(shop.items))
        throw new Error("Invalid saved shop items");

      for (const item of shop.items) {
        if (typeof item !== "object" || item === null)
          throw new Error("Invalid saved shop item");
        if (typeof item.id !== "number")
          throw new Error("Invalid saved shop item id");
        if (typeof item.name !== "string")
          throw new Error("Invalid saved shop item name");
        if (typeof item.level !== "number")
          throw new Error("Invalid saved shop item level");
        if (typeof item.game !== "string")
          throw new Error("Invalid saved shop item game");
        if (typeof item.archive_link !== "string")
          throw new Error("Invalid saved shop item link");
        if (typeof item.quantity !== "number")
          throw new Error("Invalid saved shop item quantity");
        if (typeof item.type !== "string")
          throw new Error("Invalid saved shop item type");
        if (typeof item.price !== "number")
          throw new Error("Invalid saved shop item price");
      }
    }

    const shopNames = parsedShops.map(shop => shop.name);
    if (new Set(shopNames).size !== shopNames.length) {
      throw new Error("Duplicate saved shop names");
    }

    item_store.updateShops(parsedShops);
    localStorage.setItem("shops", JSON.stringify(parsedShops));
    return true;
  } catch (error) {
    console.error(error);
    const defaultShop: shop_list[] = [{ items: [], name: "Default" }];
    item_store.updateShops(defaultShop);
    return false;
  }
}

export function validateTemplates(templates: string): boolean {
  const template_store = templateStore();
  try {
    const parsedTemplates = JSON.parse(templates);

    if (!Array.isArray(parsedTemplates))
      throw new Error("Invalid saved templates format");

    for (const template of parsedTemplates) {
      if (typeof template !== "object" || template === null)
        throw new Error("Invalid saved template");
      if (typeof template.name !== "string")
        throw new Error("Invalid saved template name");
      if (typeof template.description !== "string")
        throw new Error("Invalid saved template description");
      if (typeof template.default !== "boolean")
        throw new Error("Invalid saved template default");
      template.default = false;

      if ("source_filter" in template) {
        template.item_sources = template.source_filter;
        delete template.source_filter;
      }
      if (template.item_sources) {
        if (!Array.isArray(template.item_sources))
          throw new Error("Invalid saved template sources format");
        if (
          template.item_sources.some(
            (source: unknown) => typeof source !== "string"
          )
        ) {
          throw new Error("Invalid saved template sources");
        }
      }

      if ("rarity_filter" in template) {
        template.item_rarities = template.rarity_filter;
        delete template.rarity_filter;
      }
      if ("item_rarities" in template) {
        if (!Array.isArray(template.item_rarities))
          throw new Error("Invalid saved template rarities format");
        if (
          template.item_rarities.some(
            (rarity: unknown) => typeof rarity !== "string"
          )
        ) {
          throw new Error("Invalid saved template rarities");
        }
      }

      if ("trait_blacklist_filter" in template) {
        template.item_traits_blacklist = template.trait_blacklist_filter;
        delete template.trait_blacklist_filter;
      }
      if (template.item_traits_blacklist) {
        if (!Array.isArray(template.item_traits_blacklist))
          throw new Error("Invalid saved template traits blacklist format");
        if (
          template.item_traits_blacklist.some(
            (trait: unknown) => typeof trait !== "string"
          )
        ) {
          throw new Error("Invalid saved template traits blacklist");
        }
      }

      if ("trait_whitelist_filter" in template) {
        template.item_traits_whitelist = template.trait_whitelist_filter;
        delete template.trait_whitelist_filter;
      }
      if ("item_traits_whitelist" in template) {
        if (!Array.isArray(template.item_traits_whitelist))
          throw new Error("Invalid saved template traits whitelist format");
        if (
          template.item_traits_whitelist.some(
            (trait: unknown) => typeof trait !== "string"
          )
        ) {
          throw new Error("Invalid saved template traits whitelist");
        }
      }

      if ("type_filter" in template) {
        template.item_types = template.type_filter;
        delete template.type_filter;
      }
      if ("item_types" in template) {
        if (!Array.isArray(template.item_types))
          throw new Error("Invalid saved template types format");
        if (
          template.item_types.some((type: unknown) => typeof type !== "string")
        ) {
          throw new Error("Invalid saved template types");
        }
      }

      if (typeof template.armor_percentage !== "number")
        throw new Error("Invalid saved template armor percentage");
      if (typeof template.equipment_percentage !== "number")
        throw new Error("Invalid saved template equipment percentage");
      if (typeof template.shield_percentage !== "number")
        throw new Error("Invalid saved template shield percentage");
      if (typeof template.weapon_percentage !== "number")
        throw new Error("Invalid saved template weapon percentage");
    }

    const templateNames = parsedTemplates.map(template => template.name);
    if (new Set(templateNames).size !== templateNames.length) {
      throw new Error("Duplicate saved template names");
    }

    if (
      templateNames.some(name =>
        ["General", "Blacksmith", "Alchemist"].includes(name)
      )
    )
      throw new Error("Illegal saved template names");

    template_store.updateTemplates(parsedTemplates);
    localStorage.setItem("templates", JSON.stringify(parsedTemplates));
    return true;
  } catch (error) {
    console.error(error);
    template_store.updateTemplates([]);
    return false;
  }
}

export function validateNpcs(npcs: string): boolean {
  const npc_store = npcStore();
  try {
    const parsedNpcs = JSON.parse(npcs);

    if (!Array.isArray(parsedNpcs))
      throw new Error("Invalid saved parties format");

    if (parsedNpcs.length === 0) throw new Error("Empty saved npc");

    for (const npc of parsedNpcs) {
      if (typeof npc !== "object" || npc === null)
        throw new Error("Invalid saved npc");
      if (typeof npc.name !== "string")
        throw new Error("Invalid saved npc list name");
      if ("culture" in npc) {
        if (npc.culture === "") {
          npc.culture = false;
        }
        npc.has_culture = npc.culture;
        delete npc.culture;
      }
      if (typeof npc.has_culture !== "boolean")
        throw new Error("Invalid saved npc has_culture");
      if ("npc" in npc) {
        npc.core_npc = npc.npc;
        delete npc.npc;
      }
      if (typeof npc.core_npc !== "object" || npc.npc === null)
        throw new Error("Invalid saved core_npc");
      if (typeof npc.core_npc.name !== "string")
        throw new Error("Invalid saved npc name");
      if (
        typeof npc.core_npc.nickname !== "string" &&
        npc.core_npc.nickname !== null
      )
        throw new Error("Invalid saved npc nickname");
      if (typeof npc.core_npc.gender !== "string")
        throw new Error("Invalid saved npc gender");
      if (typeof npc.core_npc.ancestry !== "string")
        throw new Error("Invalid saved npc ancestry");
      if (typeof npc.core_npc.culture !== "string")
        throw new Error("Invalid saved npc culture");
      if (typeof npc.core_npc.class !== "string")
        throw new Error("Invalid saved npc class");
      if (typeof npc.core_npc.job !== "string")
        throw new Error("Invalid saved npc job");
      if (typeof npc.core_npc.level !== "number")
        throw new Error("Invalid saved npc level");
      if (npc.core_npc.languages && typeof npc.core_npc.languages !== "string")
        throw new Error("Invalid saved npc languages");
      if (npc.core_npc.quirk && typeof npc.core_npc.quirk !== "string")
        throw new Error("Invalid saved npc quirk");
      if (
        npc.core_npc.description &&
        typeof npc.core_npc.description !== "string"
      )
        throw new Error("Invalid saved npc description");
      if (
        npc.core_npc.personality &&
        typeof npc.core_npc.personality !== "string"
      )
        throw new Error("Invalid saved npc personality");
      if (
        npc.core_npc.relationships &&
        typeof npc.core_npc.relationships !== "string"
      )
        throw new Error("Invalid saved npc relationships");
      if (npc.core_npc.ideology && typeof npc.core_npc.ideology !== "string")
        throw new Error("Invalid saved npc ideology");

      if (!Array.isArray(npc.core_npc.custom_fields))
        throw new Error("Invalid saved custom fields format");

      for (const field of npc.core_npc.custom_fields) {
        if (typeof field !== "object" || field === null)
          throw new Error("Invalid saved custom field");
        if (field.name && typeof field.name !== "string")
          throw new Error("Invalid saved custom field name");
        if (field.body && typeof field.body !== "string")
          throw new Error("Invalid saved custom field body");
      }

      if (typeof npc.core_npc.game !== "string")
        throw new Error("Invalid saved npc game");
    }

    const npcNames = parsedNpcs.map(npc => npc.name);
    if (new Set(npcNames).size !== npcNames.length) {
      throw new Error("Duplicate saved npc names");
    }

    npc_store.updateNpcs(parsedNpcs);
    localStorage.setItem("npcs", JSON.stringify(parsedNpcs));
    return true;
  } catch (error) {
    console.error(error);
    const defaultNpc: npc_list[] = [
      {
        has_culture: false,
        name: "Default",
        core_npc: {
          ancestry: "",
          class: "",
          culture: "",
          custom_fields: [{ body: "", name: "" }],
          description: "",
          game: "pf",
          gender: "",
          ideology: "",
          job: "",
          languages: "",
          level: -1,
          name: "",
          nickname: "",
          personality: "",
          quirk: "",
          relationships: ""
        }
      }
    ];
    npc_store.updateNpcs(defaultNpc);
    return false;
  }
}
