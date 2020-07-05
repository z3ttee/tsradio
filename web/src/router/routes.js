import HomeView from '../views/pages/HomeView.vue'

const pagePrefix = 'TSRadio :: ';

export const routes = [

    // Home
    { path: '', name: 'home', component: HomeView, meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},

    // Login
    { path: '/login', name: 'login', component: () => import('../views/pages/LoginView.vue'), meta: { 
        title: pagePrefix+'Anmelden',
        group: 'default'
    }},

    // Channels
    { path: '/channels', name: 'channels', component: HomeView, meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},

    // Channel + id
    { path: '/channels/:id', name: 'channelPage', component: () => import('../views/errors/404View.vue'), meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},

    // Loaded when needed
    { path: '/404', name: '404', component: () => import('../views/errors/404View.vue'), meta: { 
        title: pagePrefix+'404',
        group: 'default'
    }}, 

    // Webinterface
    { path: '/webinterface', component: () => import('../views/pages/DashboardView.vue'), children: [
        // Dashboard
        { path: '', name: 'webinterfaceDashboard',component: () => import('../views/pages/DashboardView.vue'), meta: { 
            title: pagePrefix+'Webinterface', 
            group: 'webinterface' 
        }}
    ]},

    // Catch 404
    { path: '*', redirect: '/404' }
];