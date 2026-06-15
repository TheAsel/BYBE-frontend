import type { games, variants } from "@/types/filters";
import type { _RouterClassic } from "vue-router";

export function openSheet(
  router: _RouterClassic,
  page: "bestiary" | "hazard" | "item" | "character",
  game: games,
  id: number,
  variant?: variants
) {
  const routeData = router.resolve({
    name: page,
    query: { game: game, id: id, variant: variant?.toLowerCase() }
  });
  if (import.meta.env.IS_APP === true) {
    globalThis.open(routeData.href, "_self");
  } else {
    globalThis.open(routeData.href, "_blank");
  }
}

export function getGameFont(game: games) {
  return game === "sf" ? "Orbitron Bold" : "Good Pro Condensed";
}

export function getGameFontSize(game: games) {
  return game === "sf" ? "tw:text-2xl!" : "tw:text-3xl!";
}

export function getGameAonLink(game: games) {
  return game === "sf" ? "aonsrd" : "aonprd";
}

export function addPlus(value: number | undefined) {
  if (value !== undefined && value >= 0) {
    return "+" + value;
  } else {
    return value;
  }
}

export function cleanSymbols(description: string) {
  const symbolsRegex = /<span class="action-glyph">(\w)<\/span>/g;

  const symbol = description.matchAll(symbolsRegex);
  for (const i of symbol) {
    if (i) {
      description = description.replaceAll(
        i[0],
        '<span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl">' +
          i[1] +
          "</span>"
      );
    }
  }
  return description;
}

export function cleanDescription(description: string) {
  const cleanRegex = /<\/?(?:li)?(?:ul)?>|@Localize\[.+\]/g;

  let finalString = cleanSymbols(description);

  finalString = finalString.replaceAll(
    "<p><strong>",
    '<p class="tw:my-0!"><strong>'
  );

  finalString = finalString.replaceAll("<p>", "<span>");
  finalString = finalString.replaceAll(
    "</p>",
    '</span><br style="display: block; margin-top: 0px;"/>'
  );

  finalString = finalString.replaceAll("<h2>", "<br /><h5><strong>");
  finalString = finalString.replaceAll("</h2>", "</strong></h5>");

  finalString = finalString.replaceAll(
    "<hr />",
    '<hr class="q-separator q-separator--horizontal tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-500!" style="height: 2px;" aria-orientation="horizontal">'
  );

  finalString = finalString.replaceAll(
    "\n",
    '<br style="display: block; margin-top: 0px;"/>'
  );

  return finalString.replaceAll(cleanRegex, "");
}

export function pfActionSymbol(num: number | null, action: string) {
  if (num === 1 || num === 2 || num === 3) {
    return num;
  }
  if (action === "free") {
    return 4;
  }
  if (action === "reaction") {
    return 5;
  }
}
