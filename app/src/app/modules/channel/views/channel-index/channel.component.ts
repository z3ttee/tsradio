import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Page, Pageable } from "@soundcore/common";
import { combineLatest, map } from "rxjs";
import { Channel, TSRChannelService } from "src/app/sdk/channel";
import { TSRStreamService } from "src/app/sdk/stream/services/stream.service";
import { Future } from "src/app/utils/future";

interface ChannelIndexViewProps {
    channels: Future<Page<Channel>>;
}

@Component({
    templateUrl: "./channel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelIndexViewComponent {
    
    constructor(
        private readonly channelService: TSRChannelService,
        private readonly streamService: TSRStreamService
    ) {}

    public $props = combineLatest([
        this.channelService.findAll(new Pageable(0, 5))
    ]).pipe(
        map(([ channels ]): ChannelIndexViewProps => ({
            channels: channels
        }))
    );

    public forcePlay(channel: Channel) {
        this.streamService.play(channel).subscribe();
    }

}