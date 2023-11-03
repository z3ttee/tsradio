import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    standalone: true,
    selector: "tsr-logo",
    templateUrl: "./logo.component.html",
    styleUrls: ["./logo.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule
    ]
})
export class TSRLogoComponent {}
