import AppHomeView from '@/views/main/AppHomeView.vue'
//import AppSidebarLayout from "@/layouts/AppSidebarLayout.vue"

const routes = [
     { name: "home", path: "/", component: AppHomeView },
     { name: "channel", path: "/channel/:channelId", component: () => import("@/views/main/AppChannelView.vue") },
     { name: "catchall", path: "/:requestedPage(.*)", redirect: { name: "home" }}
]
export default routes;