import type { RouteRecordRaw } from "vue-router";

/* oxlint-disable require-await */

const routes: RouteRecordRaw[] = [
  {
    children: [
      {
        component: async () => import("@/pages/IndexPage.vue"),
        name: "home",
        path: ""
      },
      {
        component: async () => import("@/pages/DownloadPage.vue"),
        name: "download",
        path: "download"
      },
      {
        component: async () => import("@/pages/encounter/EncounterPage.vue"),
        name: "encounter",
        path: "encounter"
      },
      {
        component: async () => import("@/pages/encounter/BestiaryPage.vue"),
        name: "bestiary",
        path: "bestiary"
      },
      {
        component: async () => import("@/pages/encounter/HazardPage.vue"),
        name: "hazard",
        path: "hazard"
      },
      {
        component: async () => import("@/pages/tracker/TrackerPage.vue"),
        name: "tracker",
        path: "tracker"
      },
      {
        component: async () => import("@/pages/shop/ShopPage.vue"),
        name: "shop",
        path: "shop"
      },
      {
        component: async () => import("@/pages/shop/ItemPage.vue"),
        name: "item",
        path: "item"
      },
      {
        component: async () => import("@/pages/npc/NpcPage.vue"),
        name: "npc",
        path: "npc"
      },
      {
        component: async () => import("@/pages/npc/CharacterPage.vue"),
        name: "character",
        path: "character"
      },
      {
        component: async () => import("@/pages/city/CityPage.vue"),
        name: "city",
        path: "city"
      },
      {
        component: async () => import("@/pages/LicensePage.vue"),
        name: "license",
        path: "license"
      }
    ],
    component: async () => import("@/layouts/MainLayout.vue"),
    path: "/"
  },
  {
    path: "/:game(pf|sf)",
    redirect: to => ({
      path: "/",
      query: {
        ...to.query,
        game: to.params.game
      }
    })
  },
  {
    path: "/:game(pf|sf)/:page",
    redirect: to => ({
      path: `/${String(to.params.page)}`,
      query: {
        ...to.query,
        game: to.params.game
      }
    })
  },
  {
    component: async () => import("@/pages/ErrorNotFound.vue"),
    path: "/:catchAll(.*)*"
  }
];

export default routes;

/* oxlint-enable require-await */
