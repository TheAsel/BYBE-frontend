import { defineBoot } from '#q-app/wrappers';
import { createHead } from '@unhead/vue/client';
import Vue3Tour from 'vue3-tour';

const head = createHead();

export default defineBoot(({ app }) => {
  app.use(Vue3Tour);
  app.use(head);
});
