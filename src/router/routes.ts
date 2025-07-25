import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('../pages/IndexPage.vue') },
      {
        path: 'encounter',
        name: 'encounter',
        component: () => import('../pages/EncounterPage.vue')
      },
      {
        path: 'bestiary',
        name: 'bestiary',
        component: () => import('../pages/BestiaryPage.vue')
      },
      {
        path: 'npc',
        name: 'npc',
        component: () => import('../pages/NpcPage.vue')
      },
      {
        path: 'character',
        name: 'character',
        component: () => import('../pages/CharacterPage.vue')
      },
      {
        path: 'shop',
        name: 'shop',
        component: () => import('../pages/ShopPage.vue')
      },
      {
        path: 'item',
        name: 'item',
        component: () => import('../pages/ItemPage.vue')
      },
      {
        path: 'monster',
        name: 'monster',
        component: () => import('../pages/MonsterPage.vue')
      },
      {
        path: 'city',
        name: 'city',
        component: () => import('../pages/CityPage.vue')
      },
      {
        path: 'license',
        name: 'license',
        component: () => import('../pages/LicensePage.vue')
      },
      {
        path: 'download',
        name: 'download',
        component: () => import('../pages/DownloadPage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
];

export default routes;
