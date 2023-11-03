import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SSOGuard } from './modules/sso/guards/sso.guard';
import { MainLayoutComponent } from './layouts/main/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AdminLayoutModule } from './layouts/admin/admin-layout.module';
import { MainLayoutModule } from './layouts/main/main-layout.module';

const routes: Routes = [
  { path: "admin", component: AdminLayoutComponent, canActivate: [SSOGuard], children: [
    { path: "", canActivate: [SSOGuard], loadChildren: () => import("./modules/admin/dashboard/dashboard.module").then((m) => m.AdminDashboardModule) },
    { path: "channels", canActivate: [SSOGuard], loadChildren: () => import("./modules/admin/channels/channels.module").then((m) => m.AdminChannelsModule) },
    { path: "playlists", canActivate: [SSOGuard], loadChildren: () => import("./modules/admin/playlists/playlists.module").then((m) => m.AdminPlaylistsModule) },
  ]},
  { path: "", component: MainLayoutComponent, canActivate: [SSOGuard], children: [
    { path: "", canActivate: [SSOGuard], loadChildren: () => import("./modules/home/home.module").then((m) => m.HomeModule) },
  ]},
];

@NgModule({
  imports: [
    AdminLayoutModule,
    MainLayoutModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
