import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { IsActiveMatchOptions, RouterModule } from "@angular/router";

@Component({
    standalone: true,
    selector: "nav-list-item",
    templateUrl: "./nav-list-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterModule,
    ]
})
export class NavListItemComponent {

    @Input()
    public routerLink?: string | any[];

    @Input()
    public routerLinkActiveOptions?: {
        exact: boolean;
    } | IsActiveMatchOptions;

}