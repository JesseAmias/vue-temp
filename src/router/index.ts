import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { loginRoutes } from '@/features/login'

const routes: RouteRecordRaw[] = [...loginRoutes]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
