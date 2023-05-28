import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from "@angular/core";
import { isNull } from "@soundcore/common";
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, map } from "rxjs";
import { Artwork } from "../../modules/artwork/entities/artwork.entity";
import { environment } from "../../../environments/environment";

@Component({
    standalone: true,
    selector: "tsr-artwork",
    templateUrl: "./artwork.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule
    ]
})
export class TSRArtworkComponent implements OnDestroy {

    private readonly _artworkIdSubj: BehaviorSubject<string> = new BehaviorSubject(null);
    public readonly $src: Observable<string> = this._artworkIdSubj.asObservable().pipe(
        distinctUntilChanged(), 
        map((id) => isNull(id) ? undefined : `${this.baseUrl}${id}`), 
    );

    @Input()
    public set artwork(val: Artwork) {
        this._artworkIdSubj.next(val?.id);
    }

    public baseUrl = `${environment.api_base_uri}/v1/artworks/`;

    @ViewChild("image") public imageRef: ElementRef<HTMLImageElement>;

    public isLoading = true;
    public hasErrored = false;

    private readonly $destroy: Subject<void> = new Subject();

    constructor(private readonly cdr: ChangeDetectorRef) {}

    public ngOnDestroy(): void {
        this._artworkIdSubj.complete();
        this.$destroy.next();
        this.$destroy.complete();
    }

    public onError() {
        this.isLoading = false;
        this.hasErrored = true;
        this.cdr.detectChanges();
    }

    public onLoad() {
        this.isLoading = false;
        this.hasErrored = false;
        this.cdr.detectChanges();
    }

}