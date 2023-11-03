import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    standalone: true,
    selector: "tsr-page",
    templateUrl: "./page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ScrollingModule
    ]
})
export class TSRPageComponent {

    @Input()
    public pageTitle?: string;

    @Input()
    public pageSubtitle?: string;

}
