import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    standalone: true,
    selector: "tsr-background",
    templateUrl: "./background.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule
    ]
})
export class TSRBackgroundComponent {

}