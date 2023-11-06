import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { TSRArtworkComponent } from "../artwork/artwork.component";
import { TSREqualizerComponent } from "../equalizer/equalizer.component";
import { TSALoader } from "../loader";
import { Channel } from "../../sdk/channel";

@Component({
    standalone: true,
    selector: "tsr-channel-historical",
    templateUrl: "./channel-historical.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        TSRArtworkComponent,
        TSREqualizerComponent,
        TSALoader
    ]
})
export class TSRChannelHistoricalItemComponent {

    @Input()
    public channel: Channel;

    @Input()
    public playing = false;

    @Input()
    public selected = false;

    @Input()
    public loading = false;

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-native
    public select = new EventEmitter<Channel>();

}