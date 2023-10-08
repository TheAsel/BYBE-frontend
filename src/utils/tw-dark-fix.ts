import { watch } from 'vue';
import { Dark } from 'quasar';

let prefix = '';

prefix = 'tw-';

export function TailwindDarkFix() {
  function override_dark_setup_for_tailwind(val: boolean) {
    const html_element = document.querySelector('html');
    if (html_element) {
      html_element.classList.remove(val === true ? `${prefix}light` : `${prefix}dark`);
      html_element.classList.add(val === true ? `${prefix}dark` : `${prefix}light`);
    }
  }

  if (Dark.mode == 'auto' || Dark.isActive) override_dark_setup_for_tailwind(true);

  watch(
    () => Dark.isActive,
    (isDark) => {
      override_dark_setup_for_tailwind(isDark);
    }
  );
}
