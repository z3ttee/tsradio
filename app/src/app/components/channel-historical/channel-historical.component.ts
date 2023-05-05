import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Channel } from "src/app/sdk/channel";
import { TSRArtworkComponent } from "../artwork/artwork.component";
import { TSREqualizerComponent } from "../equalizer/equalizer.component";
import { NGSLoaderComponent } from "../loader";

@Component({
    standalone: true,
    selector: "tsr-channel-historical",
    templateUrl: "./channel-historical.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        TSRArtworkComponent,
        TSREqualizerComponent,
        NGSLoaderComponent
    ]
})
export class TSRChannelHistoricalItemComponent {

    @Input()
    public channel: Channel;

    @Input()
    public playing: boolean = false;

    @Input()
    public selected: boolean = false;

    @Input()
    public loading: boolean = false;

    @Output()
    public select = new EventEmitter<Channel>();

}