import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Pageable } from "@soundcore/common";
import { Subject, combineLatest, map, takeUntil } from "rxjs";
import { Channel, TSRChannelService } from "src/app/sdk/channel";
import { TSRStreamCoordinatorGateway } from "src/app/sdk/gateway";
import { TSRStreamService } from "src/app/sdk/stream/services/stream.service";

interface HomeViewProps {
    featured: Channel[];
    channels: Channel[];
}

@Component({
    templateUrl: "./home.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeViewComponent implements OnDestroy {
    
    constructor(
        private readonly channelService: TSRChannelService,
        private readonly streamService: TSRStreamService,
        private readonly coordinator: TSRStreamCoordinatorGateway
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $featuredChannels = this.coordinator.$featuredChannels.pipe(takeUntil(this.$destroy));
    public readonly $channels = this.coordinator.$channels.pipe(takeUntil(this.$destroy));

    public $props = combineLatest([
        this.$featuredChannels,
        this.$channels
    ]).pipe(
        map(([ featured, other ]): HomeViewProps => {
            console.log(featured, other);

            return {
                featured: featured,
                channels: other
            }
        })
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public forcePlay(channel: Channel) {
        this.streamService.play(channel).subscribe();
    }

}