import { apiFetch, apiFetchText, buildUrl } from "@/utils/fetch";

import type { games } from "@/types/filters";
import type { npc, shareable_npc, valid_genders } from "@/types/npcs";

export async function requestParameters(
  game: games,
  parameter: "genders" | "classes" | "jobs" | "cultures"
) {
  try {
    return await apiFetch<string[]>(
      buildUrl(import.meta.env.API_URL, [game, "npc", parameter])
    );
  } catch (error) {
    console.error(error);
  }
}

export async function requestAncestries(game: games) {
  try {
    return await apiFetch<valid_genders[]>(
      buildUrl(import.meta.env.API_URL, [game, "npc", "ancestries"])
    );
  } catch (error) {
    console.error(error);
  }
}

export async function npcGenerator(
  game: games,
  body: {
    gender_filter?: string[] | undefined;
    name_origin_filter?: {
      FromAncestry?: string[] | undefined;
      FromCulture?: string[] | undefined;
    };
    class_filter?: string[] | undefined;
    job_filter?: string[] | undefined;
    level_filter?: {
      min_level: number | undefined;
      max_level: number | undefined;
    };
    generate_nickname: boolean;
  }
) {
  try {
    return await apiFetch<npc>(
      buildUrl(import.meta.env.API_URL, [game, "npc", "generator"]),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function npcParametersGenerator(
  game: games,
  parameter:
    | "ancestry"
    | "class"
    | "gender"
    | "job"
    | "nickname"
    | "level"
    | "culture"
) {
  try {
    return await apiFetch<string>(
      buildUrl(import.meta.env.API_URL, [game, "npc", "generator", parameter]),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function npcLevelGenerator(game: games) {
  try {
    return await apiFetch<number>(
      buildUrl(import.meta.env.API_URL, [game, "npc", "generator", "level"]),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function npcNamesGenerator(
  game: games,
  body: {
    gender?: string | undefined;
    origin?: {
      FromAncestry?: string | undefined;
      FromCulture?: string | undefined;
    };
  }
) {
  try {
    return await apiFetch<string[]>(
      buildUrl(import.meta.env.API_URL, [game, "npc", "generator", "names"]),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function generateNpcLink(body: shareable_npc) {
  try {
    return await apiFetchText(
      buildUrl(import.meta.env.API_URL, ["shareable", "npc", "encode"]),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function decodeNpcLink(encoded_data: string) {
  try {
    return await apiFetch<shareable_npc>(
      buildUrl(import.meta.env.API_URL, [
        "shareable",
        "npc",
        "decode",
        encoded_data
      ])
    );
  } catch (error) {
    console.error(error);
  }
}
