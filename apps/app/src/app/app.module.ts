import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SSOModule } from './modules/sso/sso.module';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { SDKChannelModule } from './sdk';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SSOModule.forRoot({
      baseUrl: environment.keycloak_url,
      realm: environment.keycloak_realm,
      clientId: environment.keycloak_client_id,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      },
      loadUserProfileAtStartUp: true,
      roleMapping: {
        admin: environment.admin_role,
      }
    }),
    SDKChannelModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
