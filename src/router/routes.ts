import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('../pages/IndexPage.vue') },
      {
        path: '/download',
        name: 'download',
        component: () => import('../pages/DownloadPage.vue')
      },
      {
        path: 'encounter',
        name: 'encounter',
        component: () => import('../pages/encounter/EncounterPage.vue')
      },
      {
        path: 'bestiary',
        name: 'bestiary',
        component: () => import('../pages/encounter/BestiaryPage.vue')
      },
      {
        path: 'hazard',
        name: 'hazard',
        component: () => import('../pages/encounter/HazardPage.vue')
      },
      {
        path: 'shop',
        name: 'shop',
        component: () => import('../pages/shop/ShopPage.vue')
      },
      {
        path: 'item',
        name: 'item',
        component: () => import('../pages/shop/ItemPage.vue')
      },
      {
        path: 'npc',
        name: 'npc',
        component: () => import('../pages/npc/NpcPage.vue')
      },
      {
        path: 'character',
        name: 'character',
        component: () => import('../pages/npc/CharacterPage.vue')
      },
      {
        path: 'creature',
        name: 'creature',
        component: () => import('../pages/creature/CreaturePage.vue')
      },
      {
        path: 'city',
        name: 'city',
        component: () => import('../pages/city/CityPage.vue')
      },
      {
        path: 'license',
        name: 'license',
        component: () => import('../pages/LicensePage.vue')
      }
    ]
  },
  {
    path: '/:game(pf|sf)',
    redirect: (to) => ({
      path: '/',
      query: {
        ...to.query,
        game: to.params.game
      }
    })
  },
  {
    path: '/:game(pf|sf)/:page',
    redirect: (to) => ({
      path: `/${to.params.page as string}`,
      query: {
        ...to.query,
        game: to.params.game
      }
    })
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
];

export default routes;
