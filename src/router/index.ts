import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import * as Pages from '@/pages'
import stores from '@/stores'
import { Auth0 } from '../auth'
import { createSelectProjectGuard } from './select-project-guard'

export const ROUTES_NAME = Object.freeze({
  index: 'index',
  incidents: 'incidents',
  incident: 'incident',
  error: 'error'
})

const selectProjectGuard = createSelectProjectGuard(stores)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Pages.RootPage,
    children: [
      {
        path: '',
        name: ROUTES_NAME.index,
        component: Pages.IncidentsPage
      },
      {
        path: '/project/:projectId',
        name: ROUTES_NAME.incidents,
        component: Pages.IncidentsPage,
        beforeEnter: [Auth0.routeGuard, selectProjectGuard]
      },
      {
        path: '/project/:projectId/incidents/:id',
        name: ROUTES_NAME.incident,
        component: Pages.IncidentPage,
        beforeEnter: [Auth0.routeGuard, selectProjectGuard]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTES_NAME.error,
    component: Pages.ErrorPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
