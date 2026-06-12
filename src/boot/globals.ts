import { defineBoot } from "#q-app";
import { createHead } from "@unhead/vue/client";

const head = createHead();

export default defineBoot(({ app }) => {
  app.use(head);
});
