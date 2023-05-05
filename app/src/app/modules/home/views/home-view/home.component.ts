import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Subject, combineLatest, map, takeUntil } from "rxjs";
import { TSRArtworkComponent } from "src/app/components/artwork/artwork.component";
import { TSRChannelHistoricalItemComponent } from "src/app/components/channel-historical";
import { TSRChannelItemComponent } from "src/app/components/channel-item";
import { TSRGreetingComponent } from "src/app/components/greeting";
import { SSOUser } from "src/app/modules/sso/entities/user.entity";
import { SSOService } from "src/app/modules/sso/services/sso.service";
import { Channel, TSRChannelService } from "src/app/sdk/channel";
import { TSRStreamCoordinatorGateway } from "src/app/sdk/gateway";
import { TSRStreamService } from "src/app/sdk/stream/services/stream.service";

interface HomeViewProps {
    featured: Channel[];
    channels: Channel[];
    user: SSOUser;
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
        private readonly channelService: TSRChannelService,
        private readonly streamService: TSRStreamService,
        private readonly coordinator: TSRStreamCoordinatorGateway
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $featuredChannels = this.coordinator.$featuredChannels.pipe(takeUntil(this.$destroy));
    public readonly $channels = this.coordinator.$channels.pipe(takeUntil(this.$destroy));

    public $props = combineLatest([
        this.$featuredChannels,
        this.$channels,
        this.ssoService.$user
    ]).pipe(
        map(([ featured, other, user ]): HomeViewProps => ({
            featured: featured,
            channels: other,
            user: user
        }))
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public forcePlay(channel: Channel) {
        this.streamService.play(channel).subscribe();
    }

}