import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Channel } from "src/app/sdk/channel";

@Component({
    standalone: true,
    selector: "tsr-channel",
    templateUrl: "./channel-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TSRChannelItemComponent {

    @Input()
    public channel: Channel;

}