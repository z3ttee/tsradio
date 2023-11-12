import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { Channel } from "../../../../../sdk/channel/entities/channel.entity";
import { MatDialog } from "@angular/material/dialog";
import { map, switchMap, take } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { SDKChannelService } from "../../../../../sdk/channel";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChannelEditorDialogComponent } from "../../../../../dialogs/channel-editor-dialog/channel-editor-dialog.component";
import { isNull } from "@tsa/utilities";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TSAButtonEvent } from "../../../../../components/button";
import { ApiError } from "../../../../../utils/error/api-error";
import { Artwork } from "../../../../artwork/entities/artwork.entity";
import { Future } from "../../../../../utils/future";

@Component({
    templateUrl: "./channel-info.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminChannelInfoViewComponent implements OnInit {
    private readonly _destroyRef = inject(DestroyRef);

    protected readonly _artwork = signal<Artwork | null>(null);
    protected readonly _channel = signal<Channel | null>(null);
    protected readonly _loading = signal<boolean>(true);
    protected readonly _error = signal<ApiError | null>(null);

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly service: SDKChannelService,
        private readonly dialog: MatDialog,
        private readonly snackBar: MatSnackBar
    ) {}

    private readonly $channelId = this.activatedRoute.paramMap.pipe(map((params) => params.get("channelId")));
    private readonly $channel = this.$channelId.pipe(switchMap((channelId) => this.service.findById(channelId)));

    public ngOnInit(): void {
        this.$channel.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((response) => {
            this._error.set(response.error);
            this._loading.set(response.loading);
            this._channel.set(response.data);
            this._artwork.set(response.data?.artwork);

            console.log(response.data);
        });
    }

    public openChannelEditorDialog(channel: Channel) {
        this.dialog.open(ChannelEditorDialogComponent, {
            data: channel
        }).afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((result: Future<Channel>) => {
            if(!isNull(result)) {
                
                this._channel.set({
                    ...this._channel(),
                    ...result.data
                });
            }
        });
    }

    public restart(event: TSAButtonEvent, id: string) {
        this.service.restart(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((request) => {
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
        this.service.deleteById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((request) => {
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

    public onFileSelected(event: Event, id: string) {
        const target = event.target as HTMLInputElement;
        const file: File = target.files[0];

        if(isNull(file)) return;
        const formData = new FormData();
        formData.append("file", file);

        this.service.setArtwork(id, formData).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((request) => {
            if(request.loading) return;

            if(request.error) {
                this.snackBar.open(`Fehler: ${request.error.message}`, null, { duration: 5000 });
            } else {
                this.snackBar.open(`Artwork hochgeladen`, null, { duration: 5000 });

                this.$channel.pipe(take(1)).subscribe((channel) => {
                    if(isNull(channel)) return;
                    // this.$artworkUpdate.next(request.data);
                    // TODO: Update artwork
                });
            }
        });
    }
    
}