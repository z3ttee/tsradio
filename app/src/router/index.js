import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { name: 'setup', path: '/setup', component: () => import('@/views/setup/SetupIndexView.vue') }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
