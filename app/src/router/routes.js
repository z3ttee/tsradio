import AppHomeView from '@/views/main/AppHomeView.vue'

export default [
    { name: 'home', path: '/', component: AppHomeView },
    { name: 'login', path: '/login', component: () => import('@/views/account/AppLoginView.vue') }
]