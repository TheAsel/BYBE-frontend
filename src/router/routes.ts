import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    children: [
      {
        component: () => import("@/pages/IndexPage.vue"),
        name: "home",
        path: ""
      },
      {
        component: () => import("@/pages/DownloadPage.vue"),
        name: "download",
        path: "download"
      },
      {
        component: () => import("@/pages/encounter/EncounterPage.vue"),
        name: "encounter",
        path: "encounter"
      },
      {
        component: () => import("@/pages/encounter/BestiaryPage.vue"),
        name: "bestiary",
        path: "bestiary"
      },
      {
        component: () => import("@/pages/encounter/HazardPage.vue"),
        name: "hazard",
        path: "hazard"
      },
      {
        component: () => import("@/pages/tracker/TrackerPage.vue"),
        name: "tracker",
        path: "tracker"
      },
      {
        component: () => import("@/pages/shop/ShopPage.vue"),
        name: "shop",
        path: "shop"
      },
      {
        component: () => import("@/pages/shop/ItemPage.vue"),
        name: "item",
        path: "item"
      },
      {
        component: () => import("@/pages/npc/NpcPage.vue"),
        name: "npc",
        path: "npc"
      },
      {
        component: () => import("@/pages/npc/CharacterPage.vue"),
        name: "character",
        path: "character"
      },
      {
        component: () => import("@/pages/creature/CreaturePage.vue"),
        name: "creature",
        path: "creature"
      },
      {
        component: () => import("@/pages/city/CityPage.vue"),
        name: "city",
        path: "city"
      },
      {
        component: () => import("@/pages/LicensePage.vue"),
        name: "license",
        path: "license"
      }
    ],
    component: () => import("@/layouts/MainLayout.vue"),
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
    component: () => import("@/pages/ErrorNotFound.vue"),
    path: "/:catchAll(.*)*"
  }
];

export default routes;
