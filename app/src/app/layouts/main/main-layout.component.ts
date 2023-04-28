import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
    standalone: true,
    templateUrl: "./main-layout.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterModule
    ]
})
export class MainLayoutComponent {}