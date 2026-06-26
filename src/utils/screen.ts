import { settingsStore } from "@/stores/settings";
import { scroll } from "quasar";
import { ref, onMounted, onUnmounted } from "vue";

import type { Ref } from "vue";

export function getScreenWidth(): { width: Ref<number> } {
  const width = ref(window.innerWidth);

  const update = (): void => {
    width.value = window.innerWidth;
  };

  onMounted(() => {
    globalThis.addEventListener("resize", update);
  });

  onUnmounted(() => {
    globalThis.removeEventListener("resize", update);
  });

  return { width };
}

export function scrollDirection(element: HTMLElement | null): boolean {
  if (!element) return false;
  scroll.getVerticalScrollPosition(element);
  return scroll.getVerticalScrollPosition(element) > 0;
}

export function scrollPage(
  element: HTMLElement | null,
  direction: boolean
): void {
  if (!element) return;
  const settings_store = settingsStore();
  settings_store.setHiddenNav(true);
  setTimeout(() => {
    if (direction) {
      scroll.setVerticalScrollPosition(element, 0, 500);
    } else {
      scroll.setVerticalScrollPosition(element, element.scrollHeight, 500);
    }
  }, 10);
}
