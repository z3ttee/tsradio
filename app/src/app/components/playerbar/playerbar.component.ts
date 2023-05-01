import { ChangeDetectionStrategy, Component } from "@angular/core";
import { combineLatest, map } from "rxjs";
import { Channel } from "src/app/sdk/channel";
import { TSRStreamService } from "src/app/sdk/stream";

interface PlayerInfo {
    currentChannel?: Channel;
    isPlaying?: boolean;
    isMuted?: boolean;
    isLoading?: boolean;
    volume?: number;
}

@Component({
    selector: "tsr-playerbar",
    templateUrl: "./playerbar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TSRPlayerbarComponent {

    constructor(
        private readonly streamService: TSRStreamService
    ) {}

    public $props = combineLatest([
        this.streamService.$currentChannel,
        this.streamService.$isLoading,
        this.streamService.$isPlaying
    ]).pipe(
        map(([currentChannel, isLoading, isPlaying]): PlayerInfo => ({
            currentChannel: currentChannel,
            isLoading: isLoading,
            isPlaying: isPlaying
        })),
    );

    public forceSkip() {
        this.streamService.forceSkip().subscribe((request) => {
            console.log(request);
        })
    }

}