import { PaginationMeta } from "./pagination";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: PaginationMeta | null;
}
