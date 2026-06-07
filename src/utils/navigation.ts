import { settingsStore } from 'src/stores/settings';

export function scrollPage(isUp: boolean, top: string, bottom: string) {
  const settings = settingsStore();
  settings.setHiddenNav(true);
  setTimeout(() => {
    let offset;
    if (isUp) {
      offset = document.getElementById(top)?.offsetTop;
    } else {
      offset = document.getElementById(bottom)?.offsetTop;
    }
    if (typeof offset === 'number') {
      globalThis.scrollTo({
        top: offset - 60,
        behavior: 'smooth'
      });
    }
  }, 10);
}
