import { createHead } from "@unhead/vue/client";
import { defineBoot } from "#q-app";

const head = createHead();

export default defineBoot(({ app }) => {
  app.use(head);
});
