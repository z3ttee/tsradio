import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";
import { ApiError } from "../../utils/error/api-error";

@Component({
    standalone: true,
    selector: "tsr-error",
    templateUrl: "./error.component.html",
    styleUrls: ["./error.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        NgIconsModule
    ]
})
export class TSRErrorComponent {

    @Input()
    public icon?: string;

    @Input({ required: true })
    public error: ApiError;

    @Input()
    public compact?: boolean;

}
