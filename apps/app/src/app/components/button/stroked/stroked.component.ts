import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { TSAButtonColor, TSAButtonEvent, TSAButtonSize } from "../types";
import { CommonModule } from "@angular/common";
import { TSALoaderComponent } from "../../loader/loader.component";

@Component({
  standalone: true,
  selector: "tsa-stroked-button",
  templateUrl: "./stroked.component.html",
  styleUrls: ["../_btnstyles.scss", "./stroked.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TSALoaderComponent]
})
export class TSAStrokedButtonComponent implements OnDestroy {
  private readonly $destroy: Subject<void> = new Subject();

  @Input()
  public size: TSAButtonSize = "default";

  @Input()
  public icon = false;

  @Input()
  public full = false;

  @Input()
  public disabled = false;

  @Input()
  public color: TSAButtonColor = "primary";

  @Input()
  public showSpinner = false;

  @Output()
  public clicked: EventEmitter<TSAButtonEvent> = new EventEmitter();

  public loading = false;
  public get loaderDarkMode(): boolean {
    return (
      this.color === "accent" ||
      this.color === "info" ||
      this.color === "success" ||
      this.color === "error" ||
      this.color === "primary"
    );
  }

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  public handleOnClick(): void {
    if (this.loading || this.disabled) return;

    let subject: Subject<void> | undefined = undefined;

    if (this.showSpinner) {
      this.updateLoadiTSAtate(true);
      subject = new Subject<void>();
      subject.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.updateLoadiTSAtate(false);
      });
    }

    this.clicked.next(new TSAButtonEvent(subject));
  }

  private updateLoadiTSAtate(loading: boolean): void {
    this.loading = loading;
    this.cdr.detectChanges();
  }
}
