import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";

@Component({
    templateUrl: "./playlist-index.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistIndexViewComponent {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly dialog: MatDialog
    ) {}
    
}