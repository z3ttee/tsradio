export default [
    { name: 'home', path: '/', component: () => import('@/views/pages/default/HomePageView.vue') },
    { name: 'login', path: '/login', component: () => import('@/views/pages/default/LoginPageView.vue') },
    { name: 'setup', path: '/setup', component: () => import('@/views/pages/setup/SetupIndexView.vue') }
]