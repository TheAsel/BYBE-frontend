import { defineBoot } from '#q-app/wrappers';
import Vue3Tour from 'vue3-tour';
import { createHead } from '@unhead/vue/client';

const head = createHead();

export default defineBoot(({ app }) => {
  app.use(Vue3Tour);
  app.use(head);
});
