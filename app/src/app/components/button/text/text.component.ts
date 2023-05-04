import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { NGSButtonEvent, NGSButtonSize } from "../types";
import { CommonModule } from "@angular/common";
import { NGSLoaderComponent } from "../../loader/loader.component";

@Component({
    standalone: true,
    selector: "ngs-text-button",
    templateUrl: "./text.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        NGSLoaderComponent,
    ]
})
export class NGSTextButtonComponent implements OnDestroy {

    private readonly $destroy: Subject<void> = new Subject();

    @Input()
    public size: NGSButtonSize = "base";

    @Input()
    public full: boolean = false;

    @Input()
    public accent: boolean = false;

    @Input()
    public showSpinner: boolean = false;

    @Output()
    public clicked: EventEmitter<NGSButtonEvent> = new EventEmitter();

    public loading: boolean = false;

    constructor(private readonly cdr: ChangeDetectorRef) {}

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public handleOnClick(): void {
        let subject: Subject<void> = null;
        if(this.showSpinner) {
            this.updateLoadingState(true);
            subject = new Subject<void>();
            subject.pipe(takeUntil(this.$destroy)).subscribe(() => {
                this.updateLoadingState(false);
            });
        }

        this.clicked.next(new NGSButtonEvent(subject));
    }

    private updateLoadingState(loading: boolean): void {
        this.loading = loading;
        this.cdr.detectChanges();
    }

}