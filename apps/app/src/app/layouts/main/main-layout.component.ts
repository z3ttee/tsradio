import { ChangeDetectionStrategy, Component } from "@angular/core";
import { combineLatest, map } from "rxjs";
import { Channel } from "../../sdk/channel";
import { SSOService } from "../../modules/sso/services/sso.service";
import { TSRStreamService } from "../../sdk/stream";

interface MainLayoutProps {
    isAdmin: boolean;
    currentChannel: Channel;
}

@Component({
    templateUrl: "./main-layout.component.html",
    styleUrls: [ "./main-layout.component.scss" ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {

    constructor(
        private readonly ssoService: SSOService,
        private readonly streamService: TSRStreamService
    ) {}

    public $props = combineLatest([
        this.ssoService.$isAdmin,
        this.streamService.$currentChannel,
    ]).pipe(
        map(([isAdmin, currentChannel]): MainLayoutProps => ({
            isAdmin: isAdmin,
            currentChannel: currentChannel
        })),
    );

}