import { Dark } from "quasar";
import { watch } from "vue";

let prefix = "";

prefix = "tw:";

function override_dark_setup_for_tailwind(val: boolean): void {
  const html_element = document.querySelector("html");
  if (html_element) {
    html_element.classList.remove(val ? `${prefix}light` : `${prefix}dark`);
    html_element.classList.add(val ? `${prefix}dark` : `${prefix}light`);
  }
}

export function TailwindDarkFix(): void {
  if (Dark.mode === "auto" || Dark.isActive) {
    override_dark_setup_for_tailwind(true);
  }

  watch(
    () => Dark.isActive,
    isDark => {
      override_dark_setup_for_tailwind(isDark);
    }
  );
}
