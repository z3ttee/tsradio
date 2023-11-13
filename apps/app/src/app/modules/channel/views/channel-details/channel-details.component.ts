import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Channel, SDKChannelService } from "../../../../sdk";
import { distinctUntilChanged, filter, map, switchMap } from "rxjs";
import { TSAChannelManager } from "../../../../services/channel-manager";
import { TSAArtwork } from "../../../../components/artwork";
import { ApiError } from "../../../../utils/error/api-error";
import { TSAButtonModule } from "../../../../components/button";
import { NgIconsModule, provideIcons } from "@ng-icons/core";
import { heroArrowLeft } from "@ng-icons/heroicons/outline";
import { featherHeadphones } from "@ng-icons/feather-icons";
import { TSABadge } from "../../../../components/badge";
import { TSREqualizerComponent } from "../../../../components/equalizer/equalizer.component";
import { TSRStreamService } from "../../../../sdk/stream";
import { TSALoader } from "../../../../components/loader";

@Component({
    standalone: true,
    templateUrl: "./channel-details.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        provideIcons({ heroArrowLeft, featherHeadphones })
    ],
    imports: [
        CommonModule,
        RouterModule,
        TSABadge,
        TSALoader,
        TSAArtwork,
        TSAButtonModule,
        NgIconsModule,
        TSREqualizerComponent
    ]
})
export class TSAChannelDetailsComponent implements OnInit {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _channelService = inject(SDKChannelService);
    private readonly _streamService = inject(TSRStreamService);
    private readonly _manager = inject(TSAChannelManager);

    protected readonly _channel = signal<Channel | null>(null);
    protected readonly _loading = signal<boolean>(true);
    protected readonly _error = signal<ApiError | null>(null);

    protected readonly _isChannelSelected = signal(false);
    protected readonly _isStreamPlaying = signal(false);
    protected readonly _isStreamLoading = signal(false);

    protected readonly _listeners = computed<string>(() => {
        const channel = this._channel();
        const listeners = channel?.currentListeners ?? 0;

        if(listeners > 900) {
            return "+900";
        }
        
        return `${listeners}`;
    });

    private readonly $slug = this._activatedRoute.paramMap.pipe(
        takeUntilDestroyed(this._destroyRef), 
        map((params) => params.get("slug")),
        distinctUntilChanged(), 
    );
    private readonly $channel = this.$slug.pipe(
        takeUntilDestroyed(this._destroyRef), 
        switchMap((slug) => this._channelService.findById(slug))
    );
    private readonly $isChannelSelected = this.$channel.pipe(
        takeUntilDestroyed(this._destroyRef), 
        filter((res) => !res.loading),
        switchMap((channel) => {
        return this._streamService.$currentChannel.pipe(
            takeUntilDestroyed(this._destroyRef), 
            map((c) => c?.id === channel?.data?.id)
        );
    }));
    private readonly $onChannelUpdate = this.$channel.pipe(
        switchMap((channel) => this._manager.$onChannelUpdate.pipe(
            takeUntilDestroyed(this._destroyRef),
            filter((c) => c.id === channel.data?.id),
        ))
    );

    public ngOnInit(): void {
        this.$channel.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res) => {
            this._loading.set(res.loading);
            this._channel.set(res.data);
            this._error.set(res.error);
        });

        this.$isChannelSelected.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isSelected) => {
            this._isChannelSelected.set(isSelected);
        });

        this._streamService.$isPlaying.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isPlaying) => {
            this._isStreamPlaying.set(isPlaying);
        });
        this._streamService.$isLoading.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isLoading) => {
            this._isStreamLoading.set(isLoading);
        });
        this.$onChannelUpdate.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((channel) => {
            this._channel.set(channel);
        });
    }

    public togglePause() {
        if(this._isChannelSelected()) {
            this._streamService.togglePause().pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
        } else {
            this._streamService.play(this._channel()).pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
        }
    }
}