import { apiFetch, apiFetchText, buildUrl } from "@/utils/fetch";

import type { creature, creature_response } from "@/types/creature";
import type {
  encounter,
  encounter_data,
  encounter_info,
  random_encounter,
  shareable_encounter
} from "@/types/encounter";
import type {
  bestiary_ranges,
  creature_columns,
  creature_filters,
  games,
  hazard_columns,
  hazard_filters,
  hazard_ranges,
  variants
} from "@/types/filters";
import type { hazard, hazard_response } from "@/types/hazard";

export async function requestCreatures(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: creature_columns,
  order_by: "ascending" | "descending",
  body: creature_filters
): Promise<creature_response | null> {
  try {
    const url = buildUrl(import.meta.env.API_URL, [game, "bestiary", "list"], {
      cursor: String(cursor),
      order_by,
      page_size: String(page_size === 0 ? -1 : page_size),
      sort_by
    });
    return await apiFetch<creature_response>(url, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      method: "POST"
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestHazards(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: hazard_columns,
  order_by: "ascending" | "descending",
  body: hazard_filters
): Promise<hazard_response | null> {
  try {
    const url = buildUrl(import.meta.env.API_URL, [game, "hazard", "list"], {
      cursor: String(cursor),
      order_by,
      page_size: String(page_size === 0 ? -1 : page_size),
      sort_by
    });
    return await apiFetch<hazard_response>(url, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      method: "POST"
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestFilters(
  game: games,
  filter:
    | "traits"
    | "alignments"
    | "sizes"
    | "rarities"
    | "families"
    | "creature_types"
    | "sources"
    | "creature_roles"
): Promise<string[] | null> {
  try {
    return await apiFetch<string[]>(
      buildUrl(import.meta.env.API_URL, [game, "bestiary", filter])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestHazardFilters(
  game: games,
  filter: "traits" | "sizes" | "rarities" | "sources"
): Promise<string[] | null> {
  try {
    return await apiFetch<string[]>(
      buildUrl(import.meta.env.API_URL, [game, "hazard", filter])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestCreatureRanges(
  game: games
): Promise<bestiary_ranges | null> {
  try {
    return await apiFetch<bestiary_ranges>(
      buildUrl(import.meta.env.API_URL, [game, "bestiary", "ranges"])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestHazardRanges(
  game: games
): Promise<hazard_ranges | null> {
  try {
    return await apiFetch<hazard_ranges>(
      buildUrl(import.meta.env.API_URL, [game, "hazard", "ranges"])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestCreatureId(
  game: games,
  creature_id: number,
  variant: variants,
  is_pwl_on: boolean
): Promise<creature | null> {
  try {
    const data = await apiFetch<{ results: creature }>(
      buildUrl(
        import.meta.env.API_URL,
        [game, "bestiary", variant.toLowerCase(), String(creature_id)],
        {
          combat_data: "true",
          extra_data: "true",
          is_pwl_on,
          spellcasting_data: "true"
        }
      )
    );
    return data.results;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestHazardId(
  game: games,
  hazard_id: number
): Promise<hazard | null> {
  try {
    const data = await apiFetch<{ results: hazard }>(
      buildUrl(import.meta.env.API_URL, [game, "hazard", String(hazard_id)])
    );
    return data.results;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function encounterInfo(
  game: games,
  encounter: encounter_info
): Promise<encounter | null> {
  try {
    return await apiFetch<encounter>(
      buildUrl(import.meta.env.API_URL, [game, "encounter", "info"]),
      {
        body: JSON.stringify(encounter),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
        },
        method: "POST"
      }
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function encounterGenerator(
  game: games,
  body: encounter_data
): Promise<random_encounter | null> {
  try {
    return await apiFetch<random_encounter>(
      buildUrl(import.meta.env.API_URL, [game, "encounter", "generator"]),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
        },
        method: "POST"
      }
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateEncounterLink(
  body: shareable_encounter
): Promise<string | null> {
  try {
    return await apiFetchText(
      buildUrl(import.meta.env.API_URL, ["shareable", "encounter", "encode"]),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
        },
        method: "POST"
      }
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function decodeEncounterLink(
  encoded_data: string
): Promise<shareable_encounter | null> {
  try {
    return await apiFetch<shareable_encounter>(
      buildUrl(import.meta.env.API_URL, [
        "shareable",
        "encounter",
        "decode",
        encoded_data
      ])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
