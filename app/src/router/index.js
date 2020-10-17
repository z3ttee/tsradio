import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { name: 'home', path: '/', component: () => import('@/views/pages/default/HomePageView.vue') },
  { name: 'setup', path: '/setup', component: () => import('@/views/pages/setup/SetupIndexView.vue') }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
