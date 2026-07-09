<script setup lang="ts">
import { cleanDescription } from "@/utils/sheet";

import type { trait } from "@/types/generic";

defineProps<{
  traits: trait[];
}>();
</script>

<template>
  <template v-if="traits.length > 0"
    >(<template v-for="(trait, index) in traits" :key="trait.name"
      ><span
        v-if="trait.description !== null"
        class="tw:decoration-2 tw:underline"
        >{{
          (trait.display_name ?? trait.name.replaceAll("-", " ")).toLowerCase()
        }}<q-tooltip
          style="
            font-family:
              Good Pro,
              sans-serif;
          "
          class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
        >
          <strong
            >{{
              (
                trait.display_name ?? trait.name.replaceAll("-", " ")
              ).toUpperCase()
            }}
          </strong>
          <q-separator class="tw:my-1!" style="height: 2px" />
          <span v-html="cleanDescription(trait.description)" /> </q-tooltip
      ></span>
      <span v-else>{{
        (trait.display_name ?? trait.name.replaceAll("-", " ")).toLowerCase()
      }}</span
      >{{ index < traits.length - 1 ? ", " : "" }} </template
    >)</template
  >
</template>
