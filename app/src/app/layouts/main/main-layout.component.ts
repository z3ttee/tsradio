import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { combineLatest, map } from "rxjs";
import { NGSLoaderComponent } from "src/app/components/loader";
import { SSOService } from "src/app/modules/sso/services/sso.service";
import { Channel } from "src/app/sdk/channel";
import { TSRStreamService } from "src/app/sdk/stream/services/stream.service";

interface PlayerInfo {
    currentChannel?: Channel;
    isPlaying?: boolean;
    isMuted?: boolean;
    isLoading?: boolean;
    volume?: number;
}

interface MainLayoutProps {

    isAdmin: boolean;
    player: PlayerInfo;

}

@Component({
    standalone: true,
    templateUrl: "./main-layout.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        NGSLoaderComponent
    ]
})
export class MainLayoutComponent {

    constructor(
        private readonly ssoService: SSOService,
        private readonly streamService: TSRStreamService
    ) {}

    public $props = combineLatest([
        this.ssoService.$isAdmin,
        this.streamService.$currentChannel,
        this.streamService.$isLoading,
        this.streamService.$isPlaying
    ]).pipe(
        map(([isAdmin, currentChannel, isLoading, isPlaying]): MainLayoutProps => ({
            isAdmin: isAdmin,
            player: {
                currentChannel: currentChannel,
                isLoading: isLoading,
                isPlaying: isPlaying
            }
        })),
    );

}