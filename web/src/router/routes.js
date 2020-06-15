import HomeView from '../views/pages/HomeView.vue'

const pagePrefix = 'TSRadio :: ';

export const routes = [
    { path: '', component: HomeView, meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},
    { path: '/channels', component: HomeView, meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},
    { path: '/channels/:id', component: () => import('../views/errors/404View.vue'), meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},
    // Loaded when needed
    { path: '/404', component: () => import('../views/errors/404View.vue'), meta: { 
        title: pagePrefix+'404',
        group: 'default'
    }}, 
    { path: '/webinterface', component: () => import('../views/pages/DashboardView.vue'), children: [
        { path: '', component: () => import('../views/pages/DashboardView.vue'), meta: { title: pagePrefix+'Webinterface', group: 'webinterface' }}
    ]},
    { path: '*', redirect: '/404' }
];