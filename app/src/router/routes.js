import AppHomeView from '@/views/main/AppHomeView.vue'

export default [
    { name: 'home', path: '/', component: AppHomeView },
    { name: 'downloadApp', path: '/desktop', component: () => import('@/views/main/AppDownloadView.vue') },
    { name: 'login', path: '/login', component: () => import('@/views/account/AppLoginView.vue') }
]