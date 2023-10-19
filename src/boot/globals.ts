import { boot } from 'quasar/wrappers';
import Vue3Tour from 'vue3-tour';

const backendUrl = 'https://backbybe.fly.dev';

export default boot(({ app }) => {
  app.use(Vue3Tour);
  app.config.globalProperties.$BACKEND_URL = backendUrl;
});

export { backendUrl };
