import { NgModule } from "@angular/core";
import { MainLayoutComponent } from "./main-layout.component";
import { NgIconsModule } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { heroSignalSolid } from "@ng-icons/heroicons/solid";
import { heroCog6Tooth } from "@ng-icons/heroicons/outline";
import { TSRBackgroundComponent } from "../../components/background/background.component";
import { TSRHeaderComponent } from "../../components/header";
import { TSRPlayerbarModule } from "../../components/playerbar/playerbar.module";
import {         TSALoader,
 } from "../../components/loader";

@NgModule({
    declarations: [
        MainLayoutComponent
    ],
    imports: [
        NgIconsModule.withIcons({ heroSignalSolid, heroCog6Tooth }),
        CommonModule,
        RouterModule,
        TSRPlayerbarModule,
        TSRHeaderComponent,
        TSRBackgroundComponent,
        TSALoader
    ],
    exports: [
        MainLayoutComponent
    ]
})
export class MainLayoutModule {}