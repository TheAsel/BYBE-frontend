import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/IndexPage.vue') },
      {
        path: 'encounter',
        name: 'encounter',
        component: () => import('pages/EncounterPage.vue')
      },
      {
        path: 'npc',
        name: 'npc',
        component: () => import('pages/NpcPage.vue')
      },
      {
        path: 'shop',
        name: 'shop',
        component: () => import('pages/ShopPage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
