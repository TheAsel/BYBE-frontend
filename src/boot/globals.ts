import { boot } from 'quasar/wrappers';
import Vue3Tour from 'vue3-tour';
import { createHead } from '@unhead/vue';

const head = createHead();

export default boot(({ app }) => {
  app.use(Vue3Tour);
  app.use(head);
});
