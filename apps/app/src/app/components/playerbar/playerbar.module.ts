import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";
import { heroForward, heroSpeakerWave, heroSpeakerXMark } from "@ng-icons/heroicons/outline";
import { TSRPlayerbarComponent } from "./playerbar.component";
import { NGSLoaderComponent } from "../loader";
import { heroPauseSolid, heroPlaySolid } from "@ng-icons/heroicons/solid";
import { TSRArtworkComponent } from "../artwork/artwork.component";
import { SCNGXRangeModule } from "../range/range.module";

@NgModule({
    declarations: [
        TSRPlayerbarComponent,
    ],
    imports: [
        CommonModule,
        NgIconsModule.withIcons({ heroForward, heroPlaySolid, heroPauseSolid, heroSpeakerWave, heroSpeakerXMark }),
        NGSLoaderComponent,
        TSRArtworkComponent,
        SCNGXRangeModule
    ],
    exports: [
        TSRPlayerbarComponent
    ]
})
export class TSRPlayerbarModule {}