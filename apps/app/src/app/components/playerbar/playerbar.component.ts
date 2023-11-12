import { animate, style, transition, trigger } from "@angular/animations";
import { Platform } from "@angular/cdk/platform";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { combineLatest, map } from "rxjs";
import { TSRStreamService } from "../../sdk/stream";
import { isMobilePlatform } from "../../utils/helpers/isMobile";
import { Channel } from "../../sdk/channel";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface PlayerInfo {
    currentChannel?: Channel;
    isPlaying?: boolean;
    isMuted?: boolean;
    isLoading?: boolean;
    volume?: number;
    isMobile?: boolean;
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
export class TSRPlayerbarComponent {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _platform = inject(Platform);
    private readonly _streamService = inject(TSRStreamService);

    public $props = combineLatest([
        this._streamService.$currentChannel,
        this._streamService.$isLoading,
        this._streamService.$isPlaying,
        this._streamService.$volume,
        this._streamService.$isMuted
    ]).pipe(
        map(([currentChannel, isLoading, isPlaying, volume, isMuted]): PlayerInfo => ({
            isMobile: isMobilePlatform(this._platform),
            currentChannel: currentChannel,
            isLoading: isLoading,
            isPlaying: isPlaying,
            isMuted: isMuted,
            volume: volume
        })),
    );

    public togglePause() {
        this._streamService.togglePause().pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
    }

    public toggleMute() {
        this._streamService.toggleMute();
    }

    public setVolume(volume: number) {
        this._streamService.setVolume(volume);
    }

    public forceSkip() {
        this._streamService.forceSkip().subscribe();
    }

}