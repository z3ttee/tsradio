import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Channel } from "src/app/sdk/channel";
import { TSRArtworkComponent } from "../artwork/artwork.component";

@Component({
    standalone: true,
    selector: "tsr-channel-historical",
    templateUrl: "./channel-historical.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        TSRArtworkComponent
    ]
})
export class TSRChannelHistoricalItemComponent {

    @Input()
    public channel: Channel;

    @Output()
    public select = new EventEmitter<Channel>();

}