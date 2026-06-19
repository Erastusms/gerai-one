export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Standardizes raw page and limit parameters, returns sanitized page, limit and offset/skip.
 */
export function getPaginationParams(options: PaginationOptions) {
  const page = Math.max(1, options.page ?? 1);
  // Max limit is 100 as per specification, default is 20
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Creates the standard pagination metadata object
 */
export function createPaginationMeta(
  totalItems: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
  };
}
