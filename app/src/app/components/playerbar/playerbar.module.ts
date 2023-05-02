import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";
import { heroForward } from "@ng-icons/heroicons/outline";
import { TSRPlayerbarComponent } from "./playerbar.component";
import { NGSLoaderComponent } from "../loader";
import { heroPauseSolid, heroPlaySolid } from "@ng-icons/heroicons/solid";
import { TSRArtworkComponent } from "../artwork/artwork.component";

@NgModule({
    declarations: [
        TSRPlayerbarComponent,
    ],
    imports: [
        CommonModule,
        NgIconsModule.withIcons({ heroForward, heroPlaySolid, heroPauseSolid }),
        NGSLoaderComponent,
        TSRArtworkComponent
    ],
    exports: [
        TSRPlayerbarComponent
    ]
})
export class TSRPlayerbarModule {}