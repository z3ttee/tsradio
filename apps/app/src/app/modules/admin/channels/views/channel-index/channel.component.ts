import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Channel } from "../../../../../sdk/channel/entities/channel.entity";
import { MatDialog } from "@angular/material/dialog";
import { Subject, takeUntil } from "rxjs";
import { isNull } from "@soundcore/common";
import { ChannelEditorDialogComponent } from "../../../../../dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { environment } from "../../../../../../environments/environment";
import { SCSDKDatasource } from "../../../../../utils/datasource";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    templateUrl: "./channel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminChannelIndexViewComponent {
    private readonly _destroyRef = inject(DestroyRef);

    constructor(
        private readonly httpClient: HttpClient,
        private readonly dialog: MatDialog
    ) {}

    public readonly datasource: SCSDKDatasource<Channel> = new SCSDKDatasource(this.httpClient, `${environment.api_base_uri}/v1/channels`, 4);

    public openChannelEditorDialog() {
        this.dialog.open(ChannelEditorDialogComponent).afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((result: Channel) => {
            if(!isNull(result)) {
                this.datasource.updateOrAppendById(result.id, result);
            }
        });
    }
    
}