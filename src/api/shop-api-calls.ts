import { apiFetch, apiFetchText, buildUrl } from "@/utils/fetch";

import type {
  games,
  item_columns,
  item_filters,
  shop_ranges
} from "@/types/filters";
import type { item, item_response } from "@/types/item";
import type { shareable_shop, shop_data } from "@/types/shop";
import type { template_data } from "@/types/template";

export async function requestFilters(
  game: games,
  filter: "sources" | "traits"
): Promise<string[] | null> {
  try {
    return await apiFetch<string[]>(
      buildUrl(import.meta.env.API_URL, [game, "shop", filter])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestTemplates(
  game: games
): Promise<template_data[] | null> {
  try {
    return await apiFetch<template_data[]>(
      buildUrl(import.meta.env.API_URL, [game, "shop", "templates_data"])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestItems(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: item_columns,
  order_by: "ascending" | "descending",
  body: item_filters
): Promise<item_response | null> {
  try {
    const url = buildUrl(import.meta.env.API_URL, [game, "shop", "list"], {
      cursor: String(cursor),
      order_by,
      page_size: String(page_size === 0 ? -1 : page_size),
      sort_by
    });
    return await apiFetch<item_response>(url, {
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

export async function requestShopRanges(
  game: games
): Promise<shop_ranges | null> {
  try {
    return await apiFetch<shop_ranges>(
      buildUrl(import.meta.env.API_URL, [game, "shop", "ranges"])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestItemId(
  game: games,
  item_id: number
): Promise<item | null> {
  try {
    const data = await apiFetch<{ results: item }>(
      buildUrl(import.meta.env.API_URL, [game, "shop", "item", String(item_id)])
    );
    return data.results;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function shopGenerator(
  game: games,
  body: shop_data
): Promise<item_response | null> {
  try {
    return await apiFetch<item_response>(
      buildUrl(import.meta.env.API_URL, [game, "shop", "generator"]),
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

export async function generateShopLink(
  body: shareable_shop
): Promise<string | null> {
  try {
    return await apiFetchText(
      buildUrl(import.meta.env.API_URL, ["shareable", "shop", "encode"]),
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

export async function decodeShopLink(
  encoded_data: string
): Promise<shareable_shop | null> {
  try {
    return await apiFetch<shareable_shop>(
      buildUrl(import.meta.env.API_URL, [
        "shareable",
        "shop",
        "decode",
        encoded_data
      ])
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
