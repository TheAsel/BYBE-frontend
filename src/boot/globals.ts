import { boot } from 'quasar/wrappers';
import Vue3Tour from 'vue3-tour';
import { createHead } from '@unhead/vue';

const head = createHead();
const backendUrl = 'https://dev-test-backbybe.fly.dev';

export default boot(({ app }) => {
  app.use(Vue3Tour);
  app.use(head);

  app.config.globalProperties.$BACKEND_URL = backendUrl;
});

export { backendUrl };
