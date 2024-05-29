<script setup lang="ts">
import HeaderBar from 'components/HeaderBar.vue';
</script>

<template>
  <q-layout view="hHh lpr fFf">
    <q-page-container>
      <HeaderBar />
      <router-view style="min-height: calc(100vh - 105px)" />
      <footer class="tw-relative tw-bottom-0 tw-inset-x-0 tw-text-center tw-py-1">
        <div class="tw-max-w-[85rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <p class="tw-text-sm dark:tw-text-white/50 tw-text-black/70">
            BYBE uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community
            Use Policy (<a href="https://paizo.com/communityuse" target="_blank" rel="noopener"
              >paizo.com/communityuse</a
            >). We are expressly prohibited from charging you to use or access this content. BYBE is
            not published, endorsed, or specifically approved by Paizo. For more information about
            Paizo Inc. and Paizo products, visit
            <a href="https://paizo.com" target="_blank" rel="noopener">paizo.com</a>.
          </p>
        </div>
      </footer>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.v-step {
  background: #50596c;
  color: white;
  font-size: 0.9rem;
  max-width: 320px;
  border-radius: 6px;
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
    rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  padding: 1rem;
  pointer-events: auto;
  text-align: center;
  z-index: 10000;

  &--sticky {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    & .v-step__arrow {
      display: none;
    }
  }
}

.v-step__arrow,
.v-step__arrow::before {
  position: absolute;
  width: 10px;
  height: 10px;
  background: inherit;
}

.v-step__arrow {
  visibility: hidden;

  &--dark {
    &:before {
      background: #454d5d;
    }
  }
}

.v-step__arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
  margin-left: -5px;
}

.v-step[data-popper-placement^='top'] > .v-step__arrow {
  bottom: -5px;
}

.v-step[data-popper-placement^='bottom'] > .v-step__arrow {
  top: -5px;
}

.v-step[data-popper-placement^='right'] > .v-step__arrow {
  left: -5px;
}

.v-step[data-popper-placement^='left'] > .v-step__arrow {
  right: -5px;
}

.v-step__content {
  margin: 0 0 1rem 0;
}

.v-step__button {
  background: transparent;
  border: 0.05rem solid white;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  display: inline-block;
  font-size: 0.9rem;
  height: 2.3rem;
  line-height: 1rem;
  outline: none;
  margin: 0 0.2rem;
  padding: 0.6rem 0.7rem;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  vertical-align: middle;
  white-space: nowrap;

  &:hover {
    background-color: rgba(white, 0.95);
    color: #50596c;
  }
}

body.v-tour--active {
  pointer-events: none;
}

.v-tour {
  pointer-events: auto;
}

.v-tour__target--highlighted {
  box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.6);
  pointer-events: auto;
  z-index: 9999;
}

.v-tour__target--relative {
  position: relative;
}

@media screen {
  .only-print {
    display: none;
  }

  .only-screen {
    display: block;
  }
}

@media print {
  header,
  footer {
    display: none !important;
  }

  .q-scrollarea {
    height: 120vh !important;
    padding-top: 3vh;
  }

  .hide-print {
    visibility: hidden;
  }

  .show-print {
    visibility: visible;
  }

  .only-print {
    display: block;
  }

  .only-screen {
    display: none;
  }

  span,
  i {
    color: black !important;
  }

  .tw-flex-wrap > * {
    margin: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 1 !important;
    padding-right: 1 !important;
  }

  .q-gutter-y-xs * {
    margin-top: 0.2rem !important;
    line-height: 1.2rem !important;
  }

  .tw-text-2xl {
    font-size: 18px !important;
    padding-top: 1vh !important;
    line-height: 0.2rem !important;
    color: black !important;
  }

  .tw-text-sm {
    font-size: 12px !important;
    color: black !important;
  }

  .tw-text-base {
    font-size: 14px !important;
    color: black !important;
  }

  body {
    width: 95vh !important;
    padding-right: 30vh;
    padding-left: 5vh;
  }

  html,
  body {
    height: 99%;
    overflow: hidden;
  }
}

@-moz-document url-prefix() {
  @media print {
    body {
      padding-right: 0;
      padding-left: 0;
    }

    html,
    body {
      height: 120vh !important;
    }
  }
}
</style>
