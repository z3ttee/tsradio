import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from "@angular/core";
import { TSREqualizerComponent } from "../equalizer/equalizer.component";
import { TSALoader } from "../loader";
import { Channel } from "../../sdk/channel";
import { TSAArtwork } from "../artwork";
import { NgIconsModule, provideIcons } from "@ng-icons/core";
import { featherHeadphones } from "@ng-icons/feather-icons";

@Component({
    standalone: true,
    selector: "tsa-channel-item",
    templateUrl: "./channel-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        provideIcons({ featherHeadphones })
    ],
    imports: [
        CommonModule,
        TSAArtwork,
        TSREqualizerComponent,
        TSALoader,
        NgIconsModule
    ]
})
export class TSAChannelItemComponent {
    protected readonly _channel = signal<Channel | undefined>(undefined);
    protected readonly _listeners = computed<string>(() => {
        const channel = this._channel();
        const listeners = channel?.currentListeners ?? 0;

        if(listeners > 900) {
            return "+900";
        }
        
        return `${listeners}`;
    });

    @Input()
    public set channel(val: Channel | null | undefined) {
        this._channel.set(val ?? undefined);
    }
    public get channel(): Channel | undefined {
        return this._channel() ?? undefined;
    }

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