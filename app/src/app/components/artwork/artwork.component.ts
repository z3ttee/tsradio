import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Artwork } from "src/app/modules/artwork/entities/artwork.entity";
import { environment } from "src/environments/environment";

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

    @Input()
    public artwork: Artwork;

    public baseUrl: string = `${environment.api_base_uri}/v1/artworks/`;

    @ViewChild("image") public imageRef: ElementRef<HTMLImageElement>;

    public isLoading: boolean = true;
    public hasErrored: boolean = false;

    constructor(private readonly cdr: ChangeDetectorRef) {}

    public onError() {
        this.isLoading = false;
        this.hasErrored = true;
        this.cdr.detectChanges();
    }

    public onLoad(loading: boolean) {
        this.isLoading = false;
        this.hasErrored = false;
        this.cdr.detectChanges();
    }

}