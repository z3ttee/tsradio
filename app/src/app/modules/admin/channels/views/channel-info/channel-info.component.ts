import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { SCSDKDatasource } from "src/app/utils/datasource";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Channel } from "../../entities/channel.entity";
import { MatDialog } from "@angular/material/dialog";
import { ChannelEditorDialogComponent } from "src/app/dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { BehaviorSubject, Subject, combineLatest, map, switchMap, takeUntil } from "rxjs";
import { isNull } from "@soundcore/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ChannelService } from "../../services/channel.service";
import { Future } from "src/app/utils/future";
import { NGSButtonEvent } from "src/app/components/button/types";
import { MatSnackBar } from "@angular/material/snack-bar";


interface ChannelInfoProps {
    channel?: Future<Channel>
}

@Component({
    templateUrl: "./channel-info.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminChannelInfoViewComponent implements OnDestroy {

    private readonly $destroy = new Subject<void>();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly service: ChannelService,
        private readonly httpClient: HttpClient,
        private readonly dialog: MatDialog,
        private readonly snackBar: MatSnackBar
    ) {}

    public $channelId = this.activatedRoute.paramMap.pipe(map((params) => params.get("channelId")));
    public $channel = this.$channelId.pipe(switchMap((channelId) => this.service.findById(channelId)));
    public $channelUpdate = new BehaviorSubject<Channel>(null);

    public $props = combineLatest([
        this.$channel,
        this.$channelUpdate
    ]).pipe(
        map(([channel, update]): ChannelInfoProps => ({
            channel: {
                ...channel,
                ...update
            }
        })),
        takeUntil(this.$destroy)
    )

    public openChannelEditorDialog(channel: Channel) {
        this.dialog.open(ChannelEditorDialogComponent, {
            data: channel
        }).afterClosed().pipe(takeUntil(this.$destroy)).subscribe((result: Channel) => {
            if(!isNull(result)) this.$channelUpdate.next(result);
        })
    }

    public deleteById(event: NGSButtonEvent, id: string) {
        this.service.deleteById(id).pipe(takeUntil(this.$destroy)).subscribe((request) => {
            if(request.loading) return;

            if(request.error) {
                this.snackBar.open(`Fehler: ${request.error.message}`, null, { duration: 3000 });
            } else {
                this.router.navigate(['..'], { relativeTo: this.activatedRoute });
                this.snackBar.open(`Channel gelöscht`, null, { duration: 3000 });
            }

            event.done();
        })
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
    
}