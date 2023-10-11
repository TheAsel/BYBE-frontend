import { boot } from 'quasar/wrappers';
import 'preline';

const backendUrl = 'https://dev-bybe.fly.dev';

export default boot(({ app }) => {
  app.config.globalProperties.$BACKEND_URL = backendUrl;
});

export { backendUrl };
