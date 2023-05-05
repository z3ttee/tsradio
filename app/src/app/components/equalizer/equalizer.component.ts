import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    standalone: true,
    selector: "tsr-equalizer",
    templateUrl: "./equalizer.component.html",
    styleUrls: [ "./equalizer.component.scss" ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule
    ]
})
export class TSREqualizerComponent {

    @Input()
    public size: number;

}