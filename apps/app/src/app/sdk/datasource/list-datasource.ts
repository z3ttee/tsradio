import { Page, Pageable, isNull } from "@tsa/utilities";
import { Future } from "../../utils/future";
import { SDKBaseDatasource } from "./base-datasource";
import { DatasourceItem } from "./entities/item";

export class SDKListDatasource<TData = any> extends SDKBaseDatasource<TData> {
  protected override updateDatastream(page: Future<Page<TData>>, pageable: Pageable): DatasourceItem<TData>[] {
    // Get offset and limit from request
    const limit = pageable.limit;

    // Get page length and items list
    const length = page.data?.length ?? limit;
    const items = page.data?.items ?? [];

    // Read current datastream value
    const datastream = this.datastream;

    // Set the page items in the datastream
    datastream.splice(
      0,
      datastream.length,
      ...Array.from({ length: length }).map(
        (_, i): DatasourceItem<TData> => ({
          data: items[i],
          error: !isNull(page.error),
          loading: page.loading
        })
      )
    );

    return datastream;
  }
}
