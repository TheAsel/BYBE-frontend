import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('../pages/HomePage.vue') },
      {
        path: '/download',
        name: 'download',
        component: () => import('../pages/DownloadPage.vue')
      }
    ]
  },
  {
    path: '/pf2e/',
    name: 'pf2e_home',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '/pf2e/', component: () => import('../pages/pf2e/IndexPage.vue') },
      {
        path: 'encounter',
        name: 'pf2e_encounter',
        component: () => import('../pages/pf2e/EncounterPage.vue')
      },
      {
        path: 'bestiary',
        name: 'pf2e_bestiary',
        component: () => import('../pages/pf2e/BestiaryPage.vue')
      },
      {
        path: 'character',
        name: 'pf2e_character',
        component: () => import('../pages/pf2e/CharacterPage.vue')
      },
      {
        path: 'shop',
        name: 'pf2e_shop',
        component: () => import('../pages/pf2e/ShopPage.vue')
      },
      {
        path: 'item',
        name: 'pf2e_item',
        component: () => import('../pages/pf2e/ItemPage.vue')
      },
      {
        path: 'npc',
        name: 'pf2e_npc',
        component: () => import('../pages/pf2e/NpcPage.vue')
      },
      {
        path: 'creature',
        name: 'pf2e_creature',
        component: () => import('../pages/pf2e/MonsterPage.vue')
      },
      {
        path: 'city',
        name: 'pf2e_city',
        component: () => import('../pages/pf2e/CityPage.vue')
      },
      {
        path: 'license',
        name: 'pf2e_license',
        component: () => import('../pages/pf2e/LicensePage.vue')
      }
    ]
  },
  {
    path: '/sf2e/',
    name: 'sf2e_home',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '/sf2e/', component: () => import('../pages/sf2e/IndexPage.vue') },
      {
        path: 'encounter',
        name: 'sf2e_encounter',
        component: () => import('../pages/sf2e/EncounterPage.vue')
      },
      {
        path: 'bestiary',
        name: 'sf2e_bestiary',
        component: () => import('../pages/sf2e/BestiaryPage.vue')
      },
      {
        path: 'character',
        name: 'sf2e_character',
        component: () => import('../pages/sf2e/CharacterPage.vue')
      },
      {
        path: 'shop',
        name: 'sf2e_shop',
        component: () => import('../pages/sf2e/ShopPage.vue')
      },
      {
        path: 'item',
        name: 'sf2e_item',
        component: () => import('../pages/sf2e/ItemPage.vue')
      },
      {
        path: 'npc',
        name: 'sf2e_npc',
        component: () => import('../pages/sf2e/NpcPage.vue')
      },
      {
        path: 'creature',
        name: 'sf2e_creature',
        component: () => import('../pages/sf2e/MonsterPage.vue')
      },
      {
        path: 'city',
        name: 'sf2e_city',
        component: () => import('../pages/sf2e/CityPage.vue')
      },
      {
        path: 'license',
        name: 'sf2e_license',
        component: () => import('../pages/sf2e/LicensePage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
];

export default routes;
