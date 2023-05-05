import { animate, state, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Subject, combineLatest, map, takeUntil } from "rxjs";
import { Channel } from "src/app/sdk/channel";
import { TSRStreamCoordinatorGateway } from "src/app/sdk/gateway";
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger("enterLeaveTrigger", [
            transition(':enter', [
                style({ 
                    transform: 'translateY(10px)', 
                    opacity: 0 
                }),

                animate(200, style({ 
                    transform: 'translateY(0)',
                    opacity: 1 
                })),
            ]),
            transition(':leave', [
                animate(200, style({ 
                    transform: 'translateX(10px)', 
                    opacity: 0 
                }))
            ])
        ])
    ]
})
export class TSRPlayerbarComponent implements OnDestroy {

    private readonly $destroy = new Subject<void>();

    constructor(
        private readonly streamService: TSRStreamService
    ) {}

    public $props = combineLatest([
        this.streamService.$currentChannel,
        this.streamService.$isLoading,
        this.streamService.$isPlaying,
    ]).pipe(
        map(([currentChannel, isLoading, isPlaying]): PlayerInfo => ({
            currentChannel: currentChannel,
            isLoading: isLoading,
            isPlaying: isPlaying
        })),
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public togglePause() {
        this.streamService.togglePause().pipe(takeUntil(this.$destroy)).subscribe();
    }

    public forceSkip() {
        this.streamService.forceSkip().subscribe((request) => {
            console.log(request);
        })
    }

}