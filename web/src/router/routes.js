import HomeView from '../views/pages/HomeView.vue'

const pagePrefix = 'TSRadio :: ';

export const routes = [
    { path: '', component: HomeView, meta: { 
        title: pagePrefix+'Der bessere Sound' 
    }},
    { path: '/channels', component: HomeView, meta: { 
        title: pagePrefix+'Der bessere Sound' 
    }},
    // Loaded when needed
    { path: '/404', component: () => import('../views/errors/404View.vue'), meta: { 
        title: pagePrefix+'404' 
    }}, 
    { path: '*', redirect: '/404' }
];