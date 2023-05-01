import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { combineLatest, map } from "rxjs";
import { NGSLoaderComponent } from "src/app/components/loader";
import { TSRPlayerbarModule } from "src/app/components/playerbar/playerbar.module";
import { SSOService } from "src/app/modules/sso/services/sso.service";
import { Channel } from "src/app/sdk/channel";
import { TSRStreamService } from "src/app/sdk/stream/services/stream.service";

interface MainLayoutProps {
    isAdmin: boolean;
    currentChannel: Channel;
}

@Component({
    standalone: true,
    templateUrl: "./main-layout.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        NGSLoaderComponent,
        TSRPlayerbarModule
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
    ]).pipe(
        map(([isAdmin, currentChannel]): MainLayoutProps => ({
            isAdmin: isAdmin,
            currentChannel: currentChannel
        })),
    );

}