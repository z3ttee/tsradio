import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Channel } from "../../../../../sdk/channel/entities/channel.entity";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject, Subject, combineLatest, map, switchMap, take, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { SDKChannelService } from "../../../../../sdk/channel";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Future } from "../../../../../utils/future";
import { Artwork } from "../../../../artwork/entities/artwork.entity";
import { ChannelEditorDialogComponent } from "../../../../../dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { isNull } from "@tsa/utilities";
import { TSAButtonEvent } from "../../../../../components/button";

interface ChannelInfoProps {
    channel?: Future<Channel>;
    artwork?: Artwork;
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
        private readonly service: SDKChannelService,
        private readonly dialog: MatDialog,
        private readonly snackBar: MatSnackBar
    ) {}

    public $channelId = this.activatedRoute.paramMap.pipe(map((params) => params.get("channelId")));
    public $channel = this.$channelId.pipe(switchMap((channelId) => this.service.findById(channelId)));
    public $channelUpdate = new BehaviorSubject<Channel>(null);
    public $artworkUpdate = new BehaviorSubject<Artwork>(null);

    public $props = combineLatest([
        this.$channel,
        this.$channelUpdate,
        this.$artworkUpdate
    ]).pipe(
        map(([channel, update, artworkUpdate]): ChannelInfoProps => ({
            channel: {
                ...channel,
                ...update
            },
            artwork: artworkUpdate ?? channel.data?.artwork
        })),
        takeUntil(this.$destroy)
    );

    public openChannelEditorDialog(channel: Channel) {
        this.dialog.open(ChannelEditorDialogComponent, {
            data: channel
        }).afterClosed().pipe(takeUntil(this.$destroy)).subscribe((result: Channel) => {
            if(!isNull(result)) this.$channelUpdate.next(result);
        });
    }

    public restart(event: TSAButtonEvent, id: string) {
        this.service.restart(id).pipe(takeUntil(this.$destroy)).subscribe((request) => {
            if(request.loading) return;

            if(request.error) {
                this.snackBar.open(`Fehler: ${request.error.message}`, null, { duration: 5000 });
            } else {
                if(request.data) {
                    this.snackBar.open(`Channel neugestartet`, null, { duration: 5000 });
                } else {
                    this.snackBar.open(`Channel nicht neugestartet`, null, { duration: 5000 });
                }
            }

            event.done();
        });
    }

    public deleteById(event: TSAButtonEvent, id: string) {
        this.service.deleteById(id).pipe(takeUntil(this.$destroy)).subscribe((request) => {
            if(request.loading) return;

            if(request.error) {
                this.snackBar.open(`Fehler: ${request.error.message}`, null, { duration: 5000 });
            } else {
                this.router.navigate(['..'], { relativeTo: this.activatedRoute });
                this.snackBar.open(`Channel gelöscht`, null, { duration: 5000 });
            }

            event.done();
        });
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public onFileSelected(event: Event, id: string) {
        const target = event.target as HTMLInputElement;
        const file: File = target.files[0];

        if(isNull(file)) return;
        const formData = new FormData();
        formData.append("file", file);

        this.service.setArtwork(id, formData).pipe(takeUntil(this.$destroy)).subscribe((request) => {
            if(request.loading) return;

            if(request.error) {
                this.snackBar.open(`Fehler: ${request.error.message}`, null, { duration: 5000 });
            } else {
                this.snackBar.open(`Artwork hochgeladen`, null, { duration: 5000 });

                this.$channel.pipe(take(1)).subscribe((channel) => {
                    if(isNull(channel)) return;
                    this.$artworkUpdate.next(request.data);
                });
            }
        });
    }
    
}