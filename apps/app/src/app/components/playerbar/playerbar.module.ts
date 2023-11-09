import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";
import { heroForward, heroSpeakerWave, heroSpeakerXMark } from "@ng-icons/heroicons/outline";
import { TSRPlayerbarComponent } from "./playerbar.component";
import { heroPauseSolid, heroPlaySolid } from "@ng-icons/heroicons/solid";
import { SCNGXRangeModule } from "../range/range.module";
import { TSALoader } from "../loader";
import { TSAArtwork } from "../artwork";

@NgModule({
    declarations: [
        TSRPlayerbarComponent,
    ],
    imports: [
        CommonModule,
        NgIconsModule.withIcons({ heroForward, heroPlaySolid, heroPauseSolid, heroSpeakerWave, heroSpeakerXMark }),
        TSALoader,
        TSAArtwork,
        SCNGXRangeModule
    ],
    exports: [
        TSRPlayerbarComponent
    ]
})
export class TSRPlayerbarModule {}