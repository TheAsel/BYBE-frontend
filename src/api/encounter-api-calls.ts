import { apiFetch, apiFetchText, buildUrl } from 'src/utils/fetch';

import type { creature, creature_response } from 'src/types/creature';
import type {
  encounter,
  encounter_data,
  encounter_info,
  random_encounter,
  shareable_encounter
} from 'src/types/encounter';
import type {
  bestiary_ranges,
  creature_columns,
  creature_filters,
  games,
  hazard_columns,
  hazard_filters,
  hazard_ranges,
  variants
} from 'src/types/filters';
import type { hazard, hazard_response } from 'src/types/hazard';

export async function requestCreatures(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: creature_columns,
  order_by: 'ascending' | 'descending',
  body: creature_filters
) {
  try {
    const url = buildUrl(process.env.API_URL!, [game, 'bestiary', 'list'], {
      cursor: String(cursor),
      page_size: String(page_size === 0 ? -1 : page_size),
      sort_by,
      order_by
    });
    return await apiFetch<creature_response>(url, {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazards(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: hazard_columns,
  order_by: 'ascending' | 'descending',
  body: hazard_filters
) {
  try {
    const url = buildUrl(process.env.API_URL!, [game, 'hazard', 'list'], {
      cursor: String(cursor),
      page_size: String(page_size === 0 ? -1 : page_size),
      sort_by,
      order_by
    });
    return await apiFetch<hazard_response>(url, {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error(error);
  }
}

export async function requestFilters(
  game: games,
  filter:
    | 'traits'
    | 'alignments'
    | 'sizes'
    | 'rarities'
    | 'families'
    | 'creature_types'
    | 'sources'
    | 'creature_roles'
) {
  try {
    return await apiFetch<string[]>(buildUrl(process.env.API_URL!, [game, 'bestiary', filter]));
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazardFilters(
  game: games,
  filter: 'traits' | 'sizes' | 'rarities' | 'sources'
) {
  try {
    return await apiFetch<string[]>(buildUrl(process.env.API_URL!, [game, 'hazard', filter]));
  } catch (error) {
    console.error(error);
  }
}

export async function requestCreatureRanges(game: games) {
  try {
    return await apiFetch<bestiary_ranges>(
      buildUrl(process.env.API_URL!, [game, 'bestiary', 'ranges'])
    );
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazardRanges(game: games) {
  try {
    return await apiFetch<hazard_ranges>(
      buildUrl(process.env.API_URL!, [game, 'hazard', 'ranges'])
    );
  } catch (error) {
    console.error(error);
  }
}

export async function requestCreatureId(
  game: games,
  creature_id: number,
  variant: variants,
  is_pwl_on: boolean
) {
  try {
    const data = await apiFetch<{ results: creature }>(
      buildUrl(
        process.env.API_URL!,
        [game, 'bestiary', variant.toLowerCase(), String(creature_id)],
        {
          extra_data: 'true',
          combat_data: 'true',
          spellcasting_data: 'true',
          is_pwl_on: is_pwl_on
        }
      )
    );
    return data.results;
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazardId(game: games, hazard_id: number) {
  try {
    const data = await apiFetch<{ results: hazard }>(
      buildUrl(process.env.API_URL!, [game, 'hazard', String(hazard_id)])
    );
    return data.results;
  } catch (error) {
    console.error(error);
  }
}

export async function encounterInfo(game: games, encounter: encounter_info) {
  try {
    return await apiFetch<encounter>(buildUrl(process.env.API_URL!, [game, 'encounter', 'info']), {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(encounter)
    });
  } catch (error) {
    console.error(error);
  }
}

export async function encounterGenerator(game: games, body: encounter_data) {
  try {
    return await apiFetch<random_encounter>(
      buildUrl(process.env.API_URL!, [game, 'encounter', 'generator']),
      {
        method: 'POST',
        headers: { accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function generateEncounterLink(body: shareable_encounter) {
  try {
    return await apiFetchText(
      buildUrl(process.env.API_URL!, ['shareable', 'encounter', 'encode']),
      {
        method: 'POST',
        headers: { accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function decodeEncounterLink(encoded_data: string) {
  try {
    return await apiFetch<shareable_encounter>(
      buildUrl(process.env.API_URL!, ['shareable', 'encounter', 'decode', encoded_data])
    );
  } catch (error) {
    console.error(error);
  }
}
