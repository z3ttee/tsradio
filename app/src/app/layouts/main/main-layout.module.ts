import { NgModule } from "@angular/core";
import { MainLayoutComponent } from "./main-layout.component";
import { NgIconsModule } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NGSLoaderComponent } from "src/app/components/loader";
import { TSRPlayerbarModule } from "src/app/components/playerbar/playerbar.module";
import { heroSignalSolid } from "@ng-icons/heroicons/solid";
import { heroCog6Tooth } from "@ng-icons/heroicons/outline";
import { TSRHeaderComponent } from "src/app/components/header";

@NgModule({
    declarations: [
        MainLayoutComponent
    ],
    imports: [
        NgIconsModule.withIcons({ heroSignalSolid, heroCog6Tooth }),
        CommonModule,
        RouterModule,
        NGSLoaderComponent,
        TSRPlayerbarModule,
        TSRHeaderComponent
    ],
    exports: [
        MainLayoutComponent
    ]
})
export class MainLayoutModule {}