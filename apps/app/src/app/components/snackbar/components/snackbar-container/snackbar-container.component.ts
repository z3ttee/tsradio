import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EmbeddedViewRef,
  NgZone,
  OnDestroy,
  ViewChild
} from "@angular/core";
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from "@angular/cdk/portal";
import { Observable, Subject, take } from "rxjs";
import { tsaSnackbarAnimation } from "../../animations/snackbar.animation";
import { AnimationEvent } from "@angular/animations";
import { TSASnackbarConfig } from "../../config";

export function throwDialogContentAlreadyAttachedError(): void {
  throw Error("Attempting to attach dialog content after content is already attached");
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./snackbar-container.component.html",
  animations: [tsaSnackbarAnimation.snackbarState],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "[@state]": "_animationState",
    "(@state.done)": "onAnimationEnd($event)"
  }
})
export class TSASnackbarContainerComponent extends BasePortalOutlet implements OnDestroy {
  @ViewChild(CdkPortalOutlet, { static: true })
  private _portalOutlet!: CdkPortalOutlet;

  private readonly _onExit: Subject<void> = new Subject();
  private readonly _onEnter: Subject<void> = new Subject();

  public _animationState = "void";
  private _destroyed = false;

  public snackbarConfig!: TSASnackbarConfig;

  constructor(
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnDestroy(): void {
    this._destroyed = true;
    this.completeExit();
  }

  override attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalOutlet.hasAttached()) {
      throwDialogContentAlreadyAttachedError();
    }

    const result = this._portalOutlet.attachComponentPortal(portal);
    return result;
  }

  override attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalOutlet.hasAttached()) {
      throwDialogContentAlreadyAttachedError();
    }

    const result = this._portalOutlet.attachTemplatePortal(portal);
    return result;
  }

  public enter(): void {
    if (!this._destroyed) {
      this._animationState = "visible";
      this.cdr.detectChanges();
    }
  }

  public exit(): Observable<void> {
    // It's common for snack bars to be opened by random outside calls like HTTP requests or
    // errors. Run inside the NgZone to ensure that it functions correctly.
    this.ngZone.run(() => {
      // Note: this one transitions to `hidden`, rather than `void`, in order to handle the case
      // where multiple snack bars are opened in quick succession (e.g. two consecutive calls to
      // `MatSnackBar.open`).
      this._animationState = "hidden";
    });

    return this._onExit;
  }

  public onAnimationEnd(event: AnimationEvent): void {
    const { fromState, toState } = event;

    if ((toState === "void" && fromState !== "void") || toState === "hidden") {
      this.completeExit();
    }

    if (toState === "visible") {
      // Note: we shouldn't use `this` inside the zone callback,
      // because it can cause a memory leak.
      const onEnter = this._onEnter;

      this.ngZone.run(() => {
        onEnter.next();
        onEnter.complete();
      });
    }
  }

  /**
   * Waits for the zone to settle before removing the element. Helps prevent
   * errors where we end up removing an element which is in the middle of an animation.
   */
  private completeExit(): void {
    this.ngZone.onMicrotaskEmpty.pipe(take(1)).subscribe(() => {
      this.ngZone.run(() => {
        this._onExit.next();
        this._onExit.complete();
      });
    });
  }
}
