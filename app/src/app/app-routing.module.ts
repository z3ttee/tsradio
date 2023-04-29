import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SSOGuard } from './modules/sso/guards/sso.guard';
import { MainLayoutComponent } from './layouts/main/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AdminLayoutModule } from './layouts/admin/admin-layout.module';

const routes: Routes = [
  { path: "admin", component: AdminLayoutComponent, canActivate: [SSOGuard], children: [
    { path: "channels", canActivate: [SSOGuard], loadChildren: () => import("./modules/admin/channels/channels.module").then((m) => m.AdminChannelsModule) },
  ]},
  { path: "", component: MainLayoutComponent, canActivate: [SSOGuard], children: [
    { path: "", canActivate: [SSOGuard], loadChildren: () => import("./modules/channel/channel.module").then((m) => m.ChannelModule) },
  ]},
];

@NgModule({
  imports: [
    AdminLayoutModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
