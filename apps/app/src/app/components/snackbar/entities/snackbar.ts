import { OverlayRef } from "@angular/cdk/overlay";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { isNull } from "@tsa/utilities";
import { TSASnackbarContainerComponent } from "../components/snackbar-container/snackbar-container.component";
import { TSA_SNACKBAR_MAX_DURATION } from "../constants";
import { TSASnackbarConfig } from "../config";

export type TSASnackbarDismissReason = "dismissed" | "action" | "timeout";
export interface TSASnackbarDismissEvent {
  reason: TSASnackbarDismissReason;
}

export class TSASnackbarRef<T = unknown> {
  public instance!: T;

  private readonly _dismissedSubject: Subject<TSASnackbarDismissEvent> = new Subject();
  public readonly $afterDismissed: Observable<TSASnackbarDismissEvent> = this._dismissedSubject.asObservable();

  private readonly _actionRunniTSAubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $actionRunning: Observable<boolean> = this._actionRunniTSAubject.asObservable();

  private _timeout?: any;

  private get _isRunningAction(): boolean {
    return this._actionRunniTSAubject.getValue();
  }

  private set _isRunningAction(val: boolean) {
    this._actionRunniTSAubject.next(val);
  }

  constructor(
    public readonly containerInstance: TSASnackbarContainerComponent,
    private readonly overlayRef: OverlayRef,
    private readonly config: TSASnackbarConfig
  ) {
    this.dismissAfter(config.duration);
  }

  public dismiss(): void {
    this.dismissInternal("dismissed");
  }

  public dismissWithAction(callback?: () => void): void {
    if (this._isRunningAction) return;

    if (isNull(this.config.action)) {
      return this.dismissInternal("action");
    }

    this._isRunningAction = true;
    Promise.allSettled([this.config.action.actionFn()])
      .catch((error: Error) => {
        console.error(error);
      })
      .finally(() => {
        // Execute dismiss callback
        if (!isNull(callback)) callback();

        // Action done, dismiss snackbar
        this._isRunningAction = false;
        this.dismissInternal("action");
      });
  }

  private dismissInternal(reason: TSASnackbarDismissReason): void {
    this._dismissedSubject.next({ reason: reason });
    this._dismissedSubject.complete();
    this._actionRunniTSAubject.complete();

    this.cleanupTimeout();
    this.containerInstance.exit().subscribe(() => {
      this.cleanupDom();
    });
  }

  private dismissAfter(duration: number): void {
    const validatedDuration = Math.max(0, Math.min(TSA_SNACKBAR_MAX_DURATION, duration));
    this._timeout = setTimeout(() => {
      if (this._isRunningAction) return;
      this.dismissInternal("timeout");
    }, validatedDuration);
  }

  private cleanupTimeout(): void {
    if (!isNull(this._timeout)) {
      clearTimeout(this._timeout);
      this._timeout = undefined;
    }
  }

  private cleanupDom(): void {
    this.overlayRef.dispose();
  }
}
