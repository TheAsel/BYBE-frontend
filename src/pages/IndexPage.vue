<script setup lang="ts"></script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <main id="content" role="main">
      <div class="tw-text-center tw-py-10 tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <h1 class="tw-block text-h4 text-bold tw-text-gray-800 dark:tw-text-white sm:tw-text-4xl">
          Welcome to BYBE
        </h1>
        <p class="tw-mt-3 text-h6 tw-text-gray-600 dark:tw-text-gray-300">
          BYBE provides tools to help Pathfinder 2e Game Masters.
        </p>
      </div>
    </main>
    <div class="tw-max-w-[85rem] tw-px-4 tw-py-10 sm:tw-px-6 lg:tw-px-8 lg:tw-py-14 tw-mx-auto">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-items-center tw-gap-3 xl:tw-gap-6">
        <!-- Card -->
        <router-link
          flat
          class="tw-group tw-flex tw-gap-y-6 tw-w-full tw-h-full hover:tw-bg-gray-100 tw-rounded-lg tw-p-5 tw-transition-all dark:hover:tw-bg-white/[.075]"
          to="/encounter/"
        >
          <svg
            class="tw-flex-shrink-0 tw-w-8 tw-h-8 tw-text-gray-800 tw-mt-4 tw-mr-6 dark:tw-text-gray-200"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z"
            />
          </svg>

          <div>
            <div>
              <h3 class="tw-block text-bold tw-text-gray-800 dark:tw-text-white">
                Encounter Builder
              </h3>
              <p class="tw-text-gray-600 dark:tw-text-gray-400">
                Balance or randomly create combat encounters.
              </p>
            </div>

            <p
              class="tw-mt-3 tw-inline-flex tw-items-center tw-gap-x-2 tw-text-sm text-medium tw-text-gray-800 dark:tw-text-gray-200"
            >
              Try it out
              <svg
                class="tw-w-2.5 tw-h-2.5 tw-transition tw-ease-in-out group-hover:tw-translate-x-1"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                  fill="currentColor"
                />
              </svg>
            </p>
          </div>
        </router-link>
        <!-- End Card -->

        <!-- Card -->
        <router-link
          flat
          class="tw-group tw-flex tw-gap-y-6 tw-w-full tw-h-full hover:tw-bg-gray-100 tw-rounded-lg tw-p-5 tw-transition-all dark:hover:tw-bg-white/[.075]"
          to="/npc/"
        >
          <svg
            class="tw-flex-shrink-0 tw-w-8 tw-h-8 tw-text-gray-800 tw-mt-4 tw-mr-6 dark:tw-text-gray-200"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm4-2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5ZM9 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 9 8Zm1 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Z"
            />
            <path
              d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2ZM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.96c.026-.163.04-.33.04-.5C9 10.567 7.21 9 5 9c-2.086 0-3.8 1.398-3.984 3.181A1.006 1.006 0 0 1 1 12V4Z"
            />
          </svg>

          <div>
            <div>
              <h3 class="tw-block text-bold tw-text-gray-800 dark:tw-text-white">NPC Generator</h3>
              <p class="tw-text-gray-600 dark:tw-text-gray-400">
                Quickly generate an NPC's name, ancestry, background and quirks.
              </p>
            </div>

            <p
              class="tw-mt-3 tw-inline-flex tw-items-center tw-gap-x-2 tw-text-sm text-medium tw-text-gray-800 dark:tw-text-gray-200"
            >
              Work in progress...
              <svg
                class="tw-w-2.5 tw-h-2.5 tw-transition tw-ease-in-out group-hover:tw-translate-x-1"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                  fill="currentColor"
                />
              </svg>
            </p>
          </div>
        </router-link>
        <!-- End Card -->

        <!-- Card -->
        <router-link
          flat
          class="tw-group tw-flex tw-gap-y-6 tw-w-full tw-h-full hover:tw-bg-gray-100 tw-rounded-lg tw-p-5 tw-transition-all dark:hover:tw-bg-white/[.075]"
          to="/shop/"
        >
          <svg
            class="tw-flex-shrink-0 tw-w-8 tw-h-8 tw-text-gray-800 tw-mt-4 tw-mr-6 dark:tw-text-gray-200"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"
            />
          </svg>

          <div>
            <div>
              <h3 class="tw-block text-bold tw-text-gray-800 dark:tw-text-white">Shop Generator</h3>
              <p class="tw-text-gray-600 dark:tw-text-gray-400">
                Create various types of shops of a specific level.
              </p>
            </div>

            <p
              class="tw-mt-3 tw-inline-flex tw-items-center tw-gap-x-2 tw-text-sm text-medium tw-text-gray-800 dark:tw-text-gray-200"
            >
              Work in progress...
              <svg
                class="tw-w-2.5 tw-h-2.5 tw-transition tw-ease-in-out group-hover:tw-translate-x-1"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                  fill="currentColor"
                />
              </svg>
            </p>
          </div>
        </router-link>
        <!-- End Card -->
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
