import { CollectionViewer, DataSource, ListRange } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, Subject, Subscription, map, switchMap, takeUntil, tap } from "rxjs";
import { DatasourceItem } from "./entities/item";
import { Page, PageFilter, Pageable, isNull } from "@ngs/utilities";
import { SDKDatasourceRequestHandlerFn } from "./entities/requestHandler";
import { SDKPaginationManager, SDKStaticPaginationManager } from "./entities/paginator";
import { Future } from "@ngs/sdk";

export abstract class SDKBaseDatasource<TData = any> extends DataSource<DatasourceItem<TData>> {
  /**
   * Subject that manages the current items that
   * can be displayed in the UI
   */
  private readonly _datastream = new BehaviorSubject<DatasourceItem<TData>[]>([]);
  /**
   * Observable that emits the currently displayable items
   * in the UI
   */
  public readonly $datastream = this._datastream.asObservable();

  private readonly _destroy = new Subject<void>();
  private readonly _cancel = new Subject<void>();

  private _previousPageSize?: number;
  private _bundledViewersSubscription?: Subscription;
  private _activePaginationManager: CollectionViewer | SDKPaginationManager = new SDKStaticPaginationManager();
  private _filter?: PageFilter;

  constructor(
    /**
     * Function that is called when the datasource
     * tries to fetch a page
     */
    private readonly requestHandlerFn: SDKDatasourceRequestHandlerFn<TData>
  ) {
    super();
  }

  protected abstract updateDatastream(page: Future<Page<TData>>, pageable: Pageable): DatasourceItem<TData>[];

  protected get datastream(): DatasourceItem<TData>[] {
    return this._datastream.getValue();
  }

  override connect(collectionViewer?: CollectionViewer): Observable<readonly DatasourceItem<TData>[]> {
    // Check if the subscription is initialized
    if (!isNull(this._bundledViewersSubscription)) {
      // Datasource already connected to the UI, return
      // datastream and skip initialization
      return this.$datastream.pipe(takeUntil(this._destroy));
    }

    // Update pagination manager
    this.setPaginationManager(collectionViewer);

    // Note: We do not need to update subscription here because
    // when setting a pagination manager the subscription is
    // automatically updated

    // Return current datastream until it gets destroyed
    return this.$datastream.pipe(takeUntil(this._destroy));
  }

  override disconnect(): void {
    // Check if the subscription is initialized
    if (isNull(this._bundledViewersSubscription)) {
      console.warn("Trying to disconnect an uninitialized datasource is blocked.");
      return;
    }

    // Cancel all ongoing requests
    this._cancel.next();
    this._cancel.complete();

    // Cleanup all subscribed observables
    this._destroy.next();
    this._destroy.complete();

    // Unsubscribe main subscription
    this._bundledViewersSubscription.unsubscribe();
  }

  /**
   * Set a pagination manager which
   * the datasource will use for pagination.
   * @param manager Pagination Manager instance
   */
  public setPaginationManager(manager?: CollectionViewer | null): void {
    // Cancel all ongoing requests
    this._cancel.next();
    // Set new pagination manager
    this._activePaginationManager = manager ?? new SDKStaticPaginationManager();
    // Update the subscription
    this.updateSubscription();
  }

  /**
   * Reset all filters
   */
  public resetFilter(): void {
    // Cancel all ongoing requests
    this._cancel.next();
    // Set filter to undefined
    this._filter = undefined;
  }

  private updateSubscription(): void {
    // Cancel all ongoing requests
    this._cancel.next();

    // Check if subscription already initialized
    if (!isNull(this._bundledViewersSubscription)) {
      // If true, unsubscribe and destroy subscription
      this._bundledViewersSubscription.unsubscribe();
      this._bundledViewersSubscription = undefined;
    }

    // Initialize new subscription
    this._bundledViewersSubscription = new Subscription();

    // Subscribe to viewChange event of
    // the pagination manager
    const subscription = this._activePaginationManager.viewChange
      .pipe(
        // Use range from viewer and build page settings
        // for api calls
        map((range) => this.buildPageable(range)),
        tap((pageable) => console.log(pageable)),
        switchMap((pageable): Observable<[Future<Page<TData>>, Pageable]> => {
          // Switch to fetch implementation but abort
          // if request gets cancelled
          return this.requestHandlerFn(pageable).pipe(
            takeUntil(this._cancel),
            map((response) => [response, pageable])
          );
        }),
        // Only subscribe to the view change requests
        // until the datasource gets destroyed
        takeUntil(this._destroy)
      )
      .subscribe(([response, pageable]) => {
        // Refine items and add to datastream
        this.setPage(response, pageable);
      });

    // Add to main subscription
    this._bundledViewersSubscription.add(subscription);
  }

  /**
   * Build page settings for api calls
   * @param range Range that should be returned from api
   * @returns Pageable object to be used for api calls
   */
  private buildPageable(range: ListRange): Pageable {
    const start = Math.max(0, range.start);
    const size = Math.max(0, range.end - range.start);

    console.log(range, start, size);

    return new Pageable(start, size, this._filter);
  }

  /**
   * Set a page in the datastream
   * @param page Future of the page
   * @param pageable Page settings used in the request
   */
  private setPage(page: Future<Page<TData>>, pageable: Pageable): void {
    const datastream = this.updateDatastream(page, pageable);

    // Check if the response already resolved
    if (!page.loading && !page.error) {
      if (this._activePaginationManager instanceof SDKPaginationManager) {
        console.log(page.data?.totalSize);
        this._activePaginationManager.setTotalAmount(page.data?.totalSize ?? 0);
      }
    }

    // Push updated datastream
    this._datastream.next(datastream);
  }
}
