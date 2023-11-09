import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, combineLatest, map, takeUntil } from "rxjs";
import { Channel, ChannelOverview, SDKChannelModule, SDKChannelService } from "../../../../sdk/channel";
import { SSOUser } from "../../../sso/entities/user.entity";
import { GatewayConnection } from "../../../../sdk/gateway/gateway";
import { TSRChannelHistoricalItemComponent } from "../../../../components/channel-historical";
import { TSRChannelItemComponent } from "../../../../components/channel-item";
import { TSRGreetingComponent } from "../../../../components/greeting";
import { SSOService } from "../../../sso/services/sso.service";
import { TSRStreamCoordinatorGateway } from "../../../../sdk/gateway";
import { TSRStreamService } from "../../../../sdk/stream";
import { Future } from "../../../../utils/future";
import { isNull } from "@tsa/utilities";
import { TSAArtwork } from "../../../../components/artwork";

interface HomeViewProps {
    overview: ChannelOverview;
    isPlaying?: boolean;
    isLoading?: boolean;
    currentChannel?: Channel;
    user: SSOUser;
    connection?: GatewayConnection;
}

@Component({
    standalone: true,
    templateUrl: "./home.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        SDKChannelModule,
        TSAArtwork,
        TSRGreetingComponent,
        TSRChannelItemComponent,
        TSRChannelHistoricalItemComponent
    ]
})
export class HomeViewComponent implements OnInit, OnDestroy {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _channelService = inject(SDKChannelService);
    
    constructor(
        private readonly ssoService: SSOService,
        private readonly streamService: TSRStreamService,
        private readonly coordinator: TSRStreamCoordinatorGateway
    ) {}

    protected readonly _channelOverview = signal<Future<ChannelOverview>>(Future.loading());

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $featuredChannels = this.coordinator.$featuredChannels.pipe(takeUntil(this.$destroy));
    public readonly $channels = this.coordinator.$channels.pipe(takeUntil(this.$destroy));
    public readonly $history = this.coordinator.$history.pipe(takeUntil(this.$destroy));

    public $props = combineLatest([
        this.$featuredChannels,
        this.$channels,
        this.$history,
        this.ssoService.$user,
        this.streamService.$currentChannel,
        this.streamService.$isPlaying,
        this.streamService.$isLoading,
        this.coordinator.$connection
    ]).pipe(
        map(([ featured, other, history, user, currentChannel, isPlaying, isLoading, connection ]): HomeViewProps => ({
            overview: { featured, nonfeatured: other },
            user: user,
            isPlaying: isPlaying,
            isLoading: isLoading,
            currentChannel: currentChannel,
            connection: connection
        }))
    );

    public ngOnInit(): void {
        this._channelService.findOverview().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((response) => {
            this._channelOverview.set(response);
        });
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public forcePlay(channel: Channel) {
        if(isNull(channel)) return;
        this.streamService.play(channel).subscribe();
    }

}