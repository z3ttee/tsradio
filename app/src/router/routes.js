import AppHomeView from '@/views/main/AppHomeView.vue'
import AppError503View from '@/views/error/AppError503View.vue'

export default [
    { name: 'home', path: '/', component: AppHomeView, meta: { needsAuth: true, }},
    { name: 'downloadApp', path: '/desktop', component: () => import('@/views/main/AppDownloadView.vue'), meta: { needsAuth: true, }},
    { name: 'channelDetails', path: '/channel/:id', component: () => import('@/views/main/AppChannelView.vue'), meta: { needsAuth: true, }},
    { name: 'login', path: '/login', component: () => import('@/views/account/AppLoginView.vue'), meta: { needsAuth: false, }},
    { name: 'error503', path: '/503', component: AppError503View, meta: { needsAuth: false, }}
]