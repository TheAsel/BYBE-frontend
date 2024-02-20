import { ref } from 'vue';
import { boot } from 'quasar/wrappers';
import VueJsTour from '@globalhive/vuejs-tour';
import { createHead } from '@unhead/vue';

const head = createHead();
const backendUrl = 'https://backbybe.fly.dev';
const tour = ref();

export default boot(({ app }) => {
  app.use(VueJsTour);
  app.use(head);

  app.config.globalProperties.$BACKEND_URL = backendUrl;
  app.config.globalProperties.$TOUR = tour;
});

export { backendUrl, tour };
