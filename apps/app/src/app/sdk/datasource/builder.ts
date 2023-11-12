import { SDKDatasourceRequestHandlerFn } from "./entities/requestHandler";
import { SDKListDatasource } from "./list-datasource";

/**
 * Class that holds helper functions to
 * initialize a new datasource
 */
export class SDKDatasources {
  /**
   * Create a new instance of the list datasource.
   * This datasource can be used for all kinds of lists
   * @param requestFn Function that is called whenever a page is being fetched
   * @returns Instance of SDKListDatasource
   */
  public static list(requestFn: SDKDatasourceRequestHandlerFn): SDKListDatasource {
    return new SDKListDatasource(requestFn);
  }
}
