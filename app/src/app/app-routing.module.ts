import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SSOGuard } from './modules/sso/guards/sso.guard';
import { MainLayoutComponent } from './layouts/main/main-layout.component';

const routes: Routes = [
  { path: "", component: MainLayoutComponent, canActivate: [SSOGuard], children: [
    { path: "", canActivate: [SSOGuard], loadChildren: () => import("./modules/channel/channel.module").then((m) => m.ChannelModule) },
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
