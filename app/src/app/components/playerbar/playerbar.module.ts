import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";
import { heroForward } from "@ng-icons/heroicons/outline";
import { TSRPlayerbarComponent } from "./playerbar.component";
import { NGSLoaderComponent } from "../loader";

@NgModule({
    declarations: [
        TSRPlayerbarComponent,
    ],
    imports: [
        CommonModule,
        NgIconsModule.withIcons({ heroForward }),
        NGSLoaderComponent
    ],
    exports: [
        TSRPlayerbarComponent
    ]
})
export class TSRPlayerbarModule {}