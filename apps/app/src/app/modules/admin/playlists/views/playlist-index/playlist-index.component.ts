import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Channel } from "../../../../../sdk/channel/entities/channel.entity";
import { MatDialog } from "@angular/material/dialog";
import { Subject, takeUntil } from "rxjs";
import { isNull } from "@soundcore/common";
import { ChannelEditorDialogComponent } from "../../../../../dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { environment } from "../../../../../../environments/environment";
import { SCSDKDatasource } from "../../../../../utils/datasource";

@Component({
    templateUrl: "./playlist-index.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistIndexViewComponent implements OnDestroy {

    private readonly $destroy = new Subject<void>();

    constructor(
        private readonly httpClient: HttpClient,
        private readonly dialog: MatDialog
    ) {}

    public readonly datasource: SCSDKDatasource<Channel> = new SCSDKDatasource(this.httpClient, `${environment.api_base_uri}/v1/channels`, 4);

    public openChannelEditorDialog() {
        this.dialog.open(ChannelEditorDialogComponent).afterClosed().pipe(takeUntil(this.$destroy)).subscribe((result: Channel) => {
            if(!isNull(result)) {
                this.datasource.updateOrAppendById(result.id, result);
            }
        });
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
    
}