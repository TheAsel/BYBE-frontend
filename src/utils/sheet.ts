import type { games, variants } from "@/types/filters";
import type { _RouterClassic } from "vue-router";

export function openSheet(
  router: _RouterClassic,
  page: "bestiary" | "hazard" | "item" | "character",
  game: games,
  id: number,
  variant?: variants | null
): void {
  const routeData = router.resolve({
    name: page,
    query: { game, id, variant: variant?.toLowerCase() }
  });
  if (import.meta.env.IS_APP) {
    globalThis.open(routeData.href, "_self");
  } else {
    globalThis.open(routeData.href, "_blank");
  }
}

export function getGameFont(
  game: games
): "Orbitron Bold" | "Good Pro Condensed" {
  return game === "sf" ? "Orbitron Bold" : "Good Pro Condensed";
}

export function getGameFontSize(
  game: games
): "tw:text-2xl! tw:tracking-tight!" | "tw:text-3xl!" {
  return game === "sf" ? "tw:text-2xl! tw:tracking-tight!" : "tw:text-3xl!";
}

export function getGameFontSizeSmall(
  game: games
): "tw:text-xl! tw:tracking-tight!" | "tw:text-2xl!" {
  return game === "sf" ? "tw:text-xl! tw:tracking-tight!" : "tw:text-2xl!";
}

export function getGameAonLink(game: games): "aonsrd" | "aonprd" {
  return game === "sf" ? "aonsrd" : "aonprd";
}

export function addPlus(value: number): string {
  if (value >= 0) {
    return `+${value}`;
  }
  return String(value);
}

export function cleanSymbols(description: string): string {
  let newDescription = description;
  const symbolsRegex = /<span class="action-glyph">(\w)<\/span>/gu;

  const symbol = newDescription.matchAll(symbolsRegex);
  for (const i of symbol) {
    newDescription = newDescription.replaceAll(
      i[0],
      `<span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl">${
        i[1]
      }</span>`
    );
  }
  return newDescription;
}

export function cleanDescription(description: string): string {
  const cleanRegex = /@Localize\[.+\]/gu;

  let finalString = cleanSymbols(description);

  finalString = finalString.replaceAll("</p>\n<p>", "</p><br><p>");

  finalString = finalString.replaceAll(
    "<p><strong>",
    '<p class="tw:my-0! tw:-indent-2 tw:pl-2 q-gutter-y-xs"><strong>'
  );

  finalString = finalString.replaceAll("<p>", "<span>");
  finalString = finalString.replaceAll("</p>", "</span>");

  finalString = finalString.replaceAll("<h2>", "<br><br><h5><strong>");
  finalString = finalString.replaceAll("</h2>", "</strong></h5>");

  finalString = finalString.replaceAll(
    "<hr />",
    '<hr class="q-separator q-separator--horizontal tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-500!" style="height: 2px;" aria-orientation="horizontal">'
  );

  finalString = finalString.replaceAll(
    "<hr>",
    '<hr class="q-separator q-separator--horizontal tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-500!" style="height: 2px;" aria-orientation="horizontal">'
  );

  return finalString.replaceAll(cleanRegex, "");
}

export function pfActionSymbol(num: number | null, action: string): string {
  if (num === 1 || num === 2 || num === 3) {
    return String(num);
  }
  if (action === "free") {
    return "4";
  }
  if (action === "reaction") {
    return "5";
  }
  return "";
}
