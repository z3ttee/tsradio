import { ComponentType, NoopScrollStrategy, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentRef, Injectable, Injector, OnDestroy, Optional, SkipSelf, inject } from "@angular/core";
import { TSASnackbarContainerComponent } from "../components/snackbar-container/snackbar-container.component";
import { TSASnackbarRef } from "../entities/snackbar";
import { ComponentPortal } from "@angular/cdk/portal";
import { TSA_SNACKBAR_CONFIG } from "../constants";
import { isNull } from "@tsa/utilities";
import { TSASnackbarComponent } from "../components/snackbar/snackbar.component";
import { TSASnackbarModule } from "../snackbar.module";
import { TSASnackbarAction, TSASnackbarActionFn, TSASnackbarConfig, TSASnackbarOptions, TSA_SNACKBAR_DEFAULT_CONFIG } from "../config";

/**
 * Snackbar builder class that
 * contains the methods for configuring and showing
 * a snackbar
 */
class TSASnackbarBuilder {
  private _action?: TSASnackbarAction;
  private _duration?: number;

  constructor(
    private readonly service: TSASnackbarService,
    private readonly message: string
  ) {}

  /**
   * (Work in progress)
   * Register an action on the snackbar. This will be
   * called whenever the snackbar is clicked
   * @param {string} text Text to display on the action button
   * @param {TSASnackbarActionFn} actionFn Function callback that is executed when the action is triggered
   * @returns {TSASnackbarBuilder} Instance to the current snackbar builder
   */
  public action(text: string, actionFn: TSASnackbarActionFn): TSASnackbarBuilder {
    this._action = {
      text: text,
      actionFn: actionFn
    };

    return this;
  }

  /**
   * The duration after the snackbar is automatically dismissed
   * in milliseconds (ms)
   * @default 5000
   * @param {number} duration Duration in milliseconds (ms)
   * @returns {TSASnackbarBuilder} Instance to the current snackbar builder
   */
  public duration(duration: number): TSASnackbarBuilder {
    this._duration = duration;
    return this;
  }

  /**
   * Create the new snackbar based on the configuration
   * and open it
   * @returns {TSASnackbarRef<TSASnackbarComponent>} Snackbar reference to use for closing a snackbar or handling events
   */
  public open(): TSASnackbarRef<TSASnackbarComponent> {
    return this.service.open(this.message, {
      action: this._action,
      duration: this._duration
    });
  }
}

/**
 * Service class to create new snackbar
 * builders to efficiently generate snackbars
 */
@Injectable({
  providedIn: TSASnackbarModule
})
export class TSASnackbars {
  private readonly service = inject(TSASnackbarService);

  /**
   * Create a new snackbar builder with a message
   * @param message Message to show in the snackbar
   * @returns {TSASnackbarBuilder} Snackbar builder instance to configure the new snackbar
   */
  public message(message: string): TSASnackbarBuilder {
    return new TSASnackbarBuilder(this.service, message);
  }
}

@Injectable({
  providedIn: TSASnackbarModule
})
export class TSASnackbarService implements OnDestroy {
  /**
   * Because there may be multiple instances of this service, we have
   * to delegate snackbar refs of the current snackbar to the parent.
   * To track the snackbar on the current level (angular injection tree),
   * we have to create this variable
   */
  private _snackBarRefAtThisLevel?: TSASnackbarRef<unknown> = undefined;

  get _currentlyOpenedSnackbar(): TSASnackbarRef<unknown> | undefined {
    const parent = this._parentSnackBarService;
    return !isNull(parent) ? parent._currentlyOpenedSnackbar : this._snackBarRefAtThisLevel;
  }

  set _currentlyOpenedSnackbar(value: TSASnackbarRef<unknown> | undefined) {
    if (!isNull(this._parentSnackBarService)) {
      this._parentSnackBarService._currentlyOpenedSnackbar = value;
    } else {
      this._snackBarRefAtThisLevel = value;
    }
  }

  constructor(
    private readonly _overlay: Overlay,
    private readonly _injector: Injector,
    @Optional() @SkipSelf() private _parentSnackBarService: TSASnackbarService
  ) {}

  public ngOnDestroy(): void {
    if (this._snackBarRefAtThisLevel) {
      this._snackBarRefAtThisLevel.dismiss();
    }
  }

  /**
   * Open a new snackbar to show a message
   * @param {string} message Message to show in the snackbar
   * @returns {TSASnackbarRef<TSASnackbarComponent>} Reference on the newly created snackbar to handle events or close the snackbar
   */
  public open(message: string): TSASnackbarRef<TSASnackbarComponent>;
  /**
   * Open a new snackbar to show a message
   * @param {string} message Message to show in the snackbar
   * @param {TSASnackbarOptions} options Options object that configures the snackbar
   * @returns {TSASnackbarRef<TSASnackbarComponent>} Reference on the newly created snackbar to handle events or close the snackbar
   */
  public open(message: string, options: TSASnackbarOptions): TSASnackbarRef<TSASnackbarComponent>;
  public open(message: string, options?: TSASnackbarOptions): TSASnackbarRef<TSASnackbarComponent> {
    return this.openFromComponent<TSASnackbarComponent>(TSASnackbarComponent, {
      action: options?.action,
      duration: options?.duration ?? TSA_SNACKBAR_DEFAULT_CONFIG.duration,
      message: message
    });
  }

  /**
   * Dismiss the currently open snackbar
   */
  public dismiss(): void {
    if (!isNull(this._currentlyOpenedSnackbar)) {
      this._currentlyOpenedSnackbar.dismiss();
    }
  }

  private openFromComponent<T>(component: ComponentType<T>, config: TSASnackbarConfig): TSASnackbarRef<T> {
    return this._attach<T>(component, config);
  }

  private _attachContainer(overlayRef: OverlayRef, config: TSASnackbarConfig): TSASnackbarContainerComponent {
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {
          provide: TSA_SNACKBAR_CONFIG,
          useValue: config ?? {}
        }
      ]
    });

    const containerPortal = new ComponentPortal(TSASnackbarContainerComponent, undefined, injector);
    const containerRef: ComponentRef<TSASnackbarContainerComponent> = overlayRef.attach(containerPortal);
    containerRef.instance.snackbarConfig = config;
    return containerRef.instance;
  }

  private _attach<T>(view: ComponentType<T>, config: TSASnackbarConfig): TSASnackbarRef<T> {
    const overlayRef = this.createOverlay();
    const container = this._attachContainer(overlayRef, config);
    const snackbarRef = new TSASnackbarRef<T>(container, overlayRef, config);

    const injector = this.createInjectorContext(snackbarRef, config);
    const portal = new ComponentPortal(view, undefined, injector);
    const contentRef = container.attachComponentPortal<T>(portal);

    snackbarRef.instance = contentRef.instance;
    this.animateSnackbar<T>(snackbarRef);
    this._currentlyOpenedSnackbar = snackbarRef;
    return snackbarRef;
  }

  private animateSnackbar<T>(snackbarRef: TSASnackbarRef<T>): void {
    snackbarRef.$afterDismissed.subscribe(() => {
      // Snackbar closed, clear ref
      if (this._currentlyOpenedSnackbar == snackbarRef) {
        this._currentlyOpenedSnackbar = undefined;
      }
    });

    // Check if there is already a snackbar in view
    if (!isNull(this._currentlyOpenedSnackbar)) {
      // If true dismiss snackbar and animate next
      this._currentlyOpenedSnackbar.$afterDismissed.subscribe(() => {
        snackbarRef.containerInstance.enter();
      });
      this._currentlyOpenedSnackbar.dismiss();
      return;
    }

    // If nothing in view, just enter the snackbar
    snackbarRef.containerInstance.enter();
  }

  private createOverlay(): OverlayRef {
    // Get global position strategy
    const positionStrategy = this._overlay.position().global();
    // Center the overlay horizontally and place on bottom of screen
    positionStrategy.centerHorizontally().bottom();

    // Create scroll strategy
    const scrollStrategy = new NoopScrollStrategy();

    // Create new overlay
    return this._overlay.create({
      hasBackdrop: false,
      disposeOnNavigation: true,
      scrollStrategy: scrollStrategy,
      positionStrategy: positionStrategy
    });
  }

  private createInjectorContext(ref: TSASnackbarRef, config: TSASnackbarConfig): Injector {
    return Injector.create({
      parent: this._injector,
      providers: [
        {
          provide: TSASnackbarRef,
          useValue: ref
        },
        {
          provide: TSA_SNACKBAR_CONFIG,
          useValue: config
        }
      ]
    });
  }
}
