import { defineBoot } from '#q-app/wrappers';
import { createHead } from '@unhead/vue/client';

const head = createHead();

export default defineBoot(({ app }) => {
  app.use(head);
});
