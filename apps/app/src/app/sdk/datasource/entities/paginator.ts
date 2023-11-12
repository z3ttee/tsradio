import { CollectionViewer, ListRange } from "@angular/cdk/collections";
import { computed, signal } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export abstract class SDKPaginationManager implements CollectionViewer {
  protected readonly $destroy: Subject<void> = new Subject();

  private readonly _viewChange = new BehaviorSubject<ListRange>({ start: 0, end: this.getInitialPageSize() });
  private readonly _selectedPageSize = signal(this.getInitialPageSize());
  private readonly _currentPageIndex = signal(0);
  private readonly _totalItems = signal(0);

  /**
   * Angular Signal that holds the value for
   * the current offset that is set in the datasource
   * for the last fetched page.
   */
  public readonly activePageOffset = computed(() => this._currentPageIndex() * this._selectedPageSize());
  /**
   * Angular Signal that holds the value for
   * the current page size.
   */
  public readonly activePageSize = computed(() => this._selectedPageSize());
  /**
   * Angular Signal that holds
   * the current page index.
   */
  public readonly activePageIndex = computed(() => this._currentPageIndex());
  /**
   * Angular Signal that holds the
   * total amount of available items
   */
  public readonly totalItems = computed(() => this._totalItems());
  /**
   * Angular Signal that holds the
   * maximum page index as number value
   */
  protected readonly maxPageIndex = computed(() => {
    const total = this._totalItems() ?? 0;
    const size = Math.max(1, this._selectedPageSize());
    const pages = Math.floor(total / size) ?? 0;
    return Math.max(0, pages);
  });
  /**
   * Observable that emits changes to the view range.
   * Subscribe to the observable if you need to
   * react to changes, for example when the page changes
   * and data has to be fetched.
   * This observable is used in datasources to fetch pages
   * based on view changes or events by paginators
   */
  public readonly viewChange: Observable<ListRange> = this._viewChange.asObservable();

  /**
   * Select the previous page.
   */
  public prevPage(): void {
    this.selectPage(this._currentPageIndex() - 1);
  }

  /**
   * Select the next page.
   */
  public nextPage(): void {
    this.selectPage(this._currentPageIndex() + 1);
  }

  /**
   * Select a page by its index.
   * Note: The index cannot be smaller than 0
   * or larger than the maximum amount of
   * available pages
   */
  public selectPage(pageIndex: number): void {
    // Validate pageIndex: Must by 0 <= pageIndex <= MAX
    const index = Math.max(0, pageIndex);

    // Do not change anything if the page
    // is already active
    if (index === this._currentPageIndex()) return;

    // Update page index and emit
    // page event
    this._currentPageIndex.set(index);
    this.emitViewChange();
  }

  /**
   * Reset the pagination to the
   * first page
   */
  public reset(): void {
    this.selectPage(0);
  }

  /**
   * Set the current page size.
   * This will trigger a view change event
   * @param size Size of the pages
   */
  public setPageSize(size: number): void {
    this._currentPageIndex.set(0);
    this._selectedPageSize.set(size ?? this.getInitialPageSize());
    this.emitViewChange();
  }

  /**
   * Set the total amount of available items.
   * @param total Total amount of items
   */
  public setTotalAmount(total: number): void {
    this._totalItems.set(total);
  }

  /**
   * Emit a page event.
   * This will push a new object to the `viewChange`
   * subject/observable with the current `start` and `end`
   * values for the selected page.
   */
  protected emitViewChange(): void {
    this._viewChange.next({
      start: this.activePageOffset(),
      end: this.activePageOffset() + this.activePageSize()
    });
  }

  /**
   * Get the initially set page size.
   * This can be used to reset the paginator.
   * @returns Initial page size
   */
  private getInitialPageSize(): number {
    return 20;
  }
}

export class SDKStaticPaginationManager extends SDKPaginationManager {}
