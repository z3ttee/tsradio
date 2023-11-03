import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";

@Component({
    standalone: true,
    selector: "tsr-hint",
    templateUrl: "./hint.component.html",
    styleUrls: ["./hint.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        NgIconsModule
    ]
})
export class TSRHintComponent {

    @Input()
    public customTitle: string;

    @Input({ required: true })
    public icon: string;

}
