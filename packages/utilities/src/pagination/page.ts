import { MAX_PAGE_SIZE } from "../constants/constants";
import { objectToSearchParams } from "../utils";
import { isNull } from "../utils/utilities";
import { PageFilter } from "./filter";

export class Page<T = unknown> {
  /**
   * Amount of items on the current page
   */
  public readonly length: number = 0;
  /**
   * Index of the next page. Null, if end
   * of pagination reached
   */
  public readonly nextOffset: number | null = null;
  /**
   * Index of the previous page. Null, if start
   * of pagination reached
   */
  public readonly prevOffset: number | null = null;

  constructor(
    /**
     * List of items on the page
     */
    public readonly items: T[],
    /**
     * Amount of items that are available in total
     */
    public readonly totalSize: number,
    public readonly info?: PageInfo
  ) {
    this.length = items?.length ?? 0;

    if (!isNull(info?.limit) && !isNull(info?.offset)) {
      const limit = info?.limit as number;
      const offset = info?.offset as number;

      const maxPageIndex = Math.floor(totalSize / limit);
      const currentPageIndex = Math.floor(offset / limit);

      if (maxPageIndex > currentPageIndex + 1) this.nextOffset = offset + limit;
      if (currentPageIndex > 0) this.prevOffset = Math.max(0, offset - limit);
    }
  }

  public static of<T = unknown>(items: T[], totalSize: number, pageable?: Pageable): Page<T> {
    return new Page(items, totalSize, { limit: pageable?.limit, offset: pageable?.offset, index: pageable?.index });
  }

  public static empty<T = unknown>(pageable?: Pageable): Page<T>;
  public static empty<T = unknown>(limitOrPageable?: number | Pageable, offset?: number): Page<T> {
    if (typeof limitOrPageable === "number")
      return new Page([], 0, {
        limit: limitOrPageable,
        offset: offset,
        index: Math.floor(Math.max(0, offset ?? 0) / Math.max(1, limitOrPageable ?? 0))
      });
    return new Page([], 0, limitOrPageable?.toInfo());
  }
}

export class Pageable implements PageInfo {
  public readonly index: number;
  public readonly offset: number;
  public readonly limit: number;
  public readonly filter?: PageFilter | null;

  constructor(offset: number, size: number, filter?: PageFilter | null) {
    this.limit = Math.max(1, Math.min(MAX_PAGE_SIZE, size));
    this.offset = Math.max(0, offset);
    this.index = Math.floor(this.offset / this.limit);
    this.filter = filter;
  }

  /**
   * Get the url query string with leading "?"
   * @returns string
   */
  public toQuery(): string {
    return `?${this.toParams()}`;
  }

  /**
   * Get the url query string without leading "?"
   * @returns string
   */
  public toParams(): string {
    return `offset=${this.offset}&limit=${this.limit}${
      !isNull(this.filter) ? `&${objectToSearchParams(this.filter)}` : ""
    }`;
  }

  public toInfo(): PageInfo {
    return {
      index: this.index,
      offset: this.offset,
      limit: this.limit
    };
  }
}

export interface PageInfo {
  readonly index: number | undefined;
  readonly offset: number | undefined;
  readonly limit: number | undefined;
}
