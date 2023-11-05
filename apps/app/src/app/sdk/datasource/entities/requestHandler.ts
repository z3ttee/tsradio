import { Observable } from "rxjs";
import { Future } from "../../../utils/future";
import { Page, Pageable } from "@tsa/utilities";

/**
 * Fetch implementation that returns an observable for the datasource
 * to subscribe to. This is used to fetch a page for given page settings
 * @param pageable Page settings object
 */
export type SDKDatasourceRequestHandlerFn<TData = any> = (pageable: Pageable) => Observable<Future<Page<TData>>>;
