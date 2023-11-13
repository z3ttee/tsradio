import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { combineLatest, map } from "rxjs";
import { Channel, SDKChannelModule, SDKChannelService } from "../../../../sdk/channel";
import { SSOUser } from "../../../sso/entities/user.entity";
import { GatewayConnection } from "../../../../sdk/gateway/gateway";
import { TSAChannelItemComponent } from "../../../../components/channel-item";
import { TSRGreetingComponent } from "../../../../components/greeting";
import { SSOService } from "../../../sso/services/sso.service";
import { TSRStreamCoordinatorGateway } from "../../../../sdk/gateway";
import { TSRStreamService } from "../../../../sdk/stream";
import { isNull } from "@tsa/utilities";
import { TSAArtwork } from "../../../../components/artwork";
import { TSAChannelManager } from "../../../../services/channel-manager";

interface HomeViewProps {
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
        TSAChannelItemComponent,
    ]
})
export class HomeViewComponent {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _channelService = inject(SDKChannelService);
    protected readonly _channelManager = inject(TSAChannelManager);
    
    constructor(
        private readonly ssoService: SSOService,
        private readonly streamService: TSRStreamService,
        private readonly coordinator: TSRStreamCoordinatorGateway
    ) {}

    public $props = combineLatest([
        this.ssoService.$user,
        this.streamService.$currentChannel,
        this.streamService.$isPlaying,
        this.streamService.$isLoading,
        this.coordinator.$connection
    ]).pipe(
        map(([ user, currentChannel, isPlaying, isLoading, connection ]): HomeViewProps => ({
            user: user,
            isPlaying: isPlaying,
            isLoading: isLoading,
            currentChannel: currentChannel,
            connection: connection
        }))
    );

    public forcePlay(channel: Channel) {
        if(isNull(channel)) return;
        this.streamService.play(channel).subscribe();
    }

}