const Home = resolve => {
    require.ensure(['./views/pages/HomeView.vue'], () => {
        resolve(require('./views/pages/HomeView.vue'));
    }, 'group');
}
const Error404 = resolve => {
    require.ensure(['./views/pages/404View.vue'], () => {
        resolve(require('./views/pages/404View.vue'));
    }, 'error');
}

const pagePrefix = 'TSRadio :: ';

export const routes = [
    { path: '', component: Home, meta: {
        title: pagePrefix+'Der bessere Sound'
    }},
    { path: '/channels', component: Home, meta: {
        title: pagePrefix+'Der bessere Sound'
    }},
    { path: '/404', component: Error404, meta: {
        title: pagePrefix+'404'
    }},
    { path: '*', redirect: '/404' }
];