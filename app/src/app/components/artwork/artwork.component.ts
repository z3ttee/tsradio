import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
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

}