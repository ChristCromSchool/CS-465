import { Trip } from "./trip";

// app_admin/src/app/models/search-result.ts
export interface SearchResult {
  trips: Trip[];
  total: number;
  page: number;
  pageSize: number;
}
