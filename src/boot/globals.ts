import { boot } from 'quasar/wrappers';

const backendUrl = 'https://backbybe.fly.dev';

export default boot(({ app }) => {
  app.config.globalProperties.$BACKEND_URL = backendUrl;
});

export { backendUrl };
