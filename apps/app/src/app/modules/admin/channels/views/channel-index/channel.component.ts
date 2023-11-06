import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Channel } from "../../../../../sdk/channel/entities/channel.entity";
import { MatDialog } from "@angular/material/dialog";
import { ChannelEditorDialogComponent } from "../../../../../dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SDKChannelService, SDKDatasources } from "../../../../../sdk";
import { isNull } from "@tsa/utilities";
import { TSASnackbars } from "../../../../../components/snackbar";

@Component({
    templateUrl: "./channel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminChannelIndexViewComponent {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _channelService = inject(SDKChannelService);
    private readonly _snackbars = inject(TSASnackbars);

    constructor(
        private readonly httpClient: HttpClient,
        private readonly dialog: MatDialog
    ) {}

    protected readonly _datasource = SDKDatasources.list((pageable) => {
        return this._channelService.findAll(pageable);
    });
    protected readonly $datastream = this._datasource.connect();

    public openChannelEditorDialog() {
        this.dialog.open(ChannelEditorDialogComponent).afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((result: Channel) => {
            if(!isNull(result)) {
                // this.datasource.updateOrAppendById(result.id, result);
                this._snackbars.message("Channel wurde erfolgreich angelegt").open();
            }
        });
    }
    
}