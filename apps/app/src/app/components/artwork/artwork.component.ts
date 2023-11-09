import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild, computed, effect, signal } from "@angular/core";
import { Artwork } from "../../modules/artwork/entities/artwork.entity";
import { environment } from "../../../environments/environment";
import { isNull } from "@tsa/utilities";

@Component({
    standalone: true,
    selector: "tsr-artwork",
    templateUrl: "./artwork.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule
    ]
})
export class TSRArtworkComponent {

    private readonly _artwork = signal<Artwork | null>(null);

    protected readonly _loading = signal<boolean>(true);
    protected readonly _errored = signal<boolean>(false);

    protected readonly _imgSrc = computed(() => {
        const artwork = this._artwork();
        if(isNull(artwork)) return null;
        return `${environment.api_base_uri}/v1/artworks/${artwork?.id}`;
    });


    @Input()
    public set artwork(val: Artwork) {
        console.log("artwork", val?.id);
        this._artwork.set(val ?? null);
    }

    @ViewChild("image") public imageRef: ElementRef<HTMLImageElement>;


    constructor(private readonly cdr: ChangeDetectorRef) {
        effect(() => {
            console.log(this._imgSrc());
        });
    }

    public onError() {
        console.log("on error");
        this._errored.set(true);
        this._loading.set(false);
    }

    public onLoad() {
        console.log("on load");
        this._errored.set(false);
        this._loading.set(false);
    }

}