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
    { path: '/channels/:id', name: 'channelPage', component: () => import('../views/pages/ChannelDetailsView.vue'), meta: { 
        title: pagePrefix+'Der bessere Sound',
        group: 'default'
    }},

    // Loaded when needed
    { path: '/404', name: '404', component: () => import('../views/errors/404View.vue'), meta: { 
        title: pagePrefix+'404',
        group: 'default'
    }}, 

    // Webinterface
    { path: '/webinterface',  component: () => import('../views/pages/webinterface/Webinterface.vue'), children: [
        //{ path: 'member', component: () => import('../views/pages/webinterface/member/MemberOverview.vue') }
        // Dashboard
        { path: '', name: 'webinterfaceDashboard', component: () => import('../views/pages/webinterface/Webinterface.vue'), meta: { 
            title: pagePrefix+'Webinterface', 
            sidebarComponent: 'DashboardActions',
            sidebarTitle: 'Dashboard',
            group: 'webinterface' 
        }},
        // Members
        { path: 'members/', redirect: "members/overview", name: 'webinterfaceMembers'},
        { path: 'members/:action', name: 'webinterfaceMembersAction', component: () => import('../views/pages/webinterface/member/MemberIndex.vue'), meta: { 
            title: pagePrefix+'Benutzerverwaltung', 
            sidebarComponent: 'MembersActions',
            sidebarTitle: 'Benutzerverwaltung',
            group: 'webinterface' 
        }},
        // Channels
        { path: 'channels/', name: 'webinterfaceChannels',component: () => import('../views/pages/webinterface/Webinterface.vue'), meta: { 
            title: pagePrefix+'Channels', 
            sidebarComponent: 'ChannelsActions',
            sidebarTitle: 'Channel verwalten',
            group: 'webinterface' 
        }},
        // Playlists
        { path: 'playlists/', name: 'webinterfacePlaylists',component: () => import('../views/pages/webinterface/Webinterface.vue'), meta: { 
            title: pagePrefix+'Playlists', 
            sidebarComponent: 'PlaylistsActions',
            sidebarTitle: 'Playlisten verwalten',
            group: 'webinterface' 
        }}
    ]},

    // Catch 404
    { path: '*', redirect: '/404' }
];