export interface IPagination<T> {
  count: number;
  offset: number;
  limit: number;
  data: Array<T>;
}
