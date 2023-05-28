import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { isNull } from "@soundcore/common";
import { Subject, combineLatest, map, takeUntil } from "rxjs";
import { Channel } from "../../../../sdk/channel";
import { SSOUser } from "../../../sso/entities/user.entity";
import { GatewayConnection } from "../../../../sdk/gateway/gateway";
import { TSRArtworkComponent } from "../../../../components/artwork/artwork.component";
import { TSRChannelHistoricalItemComponent } from "../../../../components/channel-historical";
import { TSRChannelItemComponent } from "../../../../components/channel-item";
import { TSRGreetingComponent } from "../../../../components/greeting";
import { SSOService } from "../../../sso/services/sso.service";
import { TSRStreamCoordinatorGateway } from "../../../../sdk/gateway";
import { TSRStreamService } from "../../../../sdk/stream";

interface HomeViewProps {
    history: Channel[];
    featured: Channel[];
    channels: Channel[];
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
        TSRArtworkComponent,
        TSRGreetingComponent,
        TSRChannelItemComponent,
        TSRChannelHistoricalItemComponent
    ]
})
export class HomeViewComponent implements OnDestroy {
    
    constructor(
        private readonly ssoService: SSOService,
        private readonly streamService: TSRStreamService,
        private readonly coordinator: TSRStreamCoordinatorGateway
    ) {}

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
            history: history,
            featured: featured,
            channels: other,
            user: user,
            isPlaying: isPlaying,
            isLoading: isLoading,
            currentChannel: currentChannel,
            connection: connection
        }))
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public forcePlay(channel: Channel) {
        if(isNull(channel)) return;
        this.streamService.play(channel).subscribe();
    }

}