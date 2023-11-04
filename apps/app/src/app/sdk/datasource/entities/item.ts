export class DatasourceItem<TData = any> {
  constructor(
    public readonly data: TData,
    public readonly loading: boolean,
    public readonly error: boolean
  ) {}
}
