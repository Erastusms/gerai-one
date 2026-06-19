export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  errors?: ApiFieldError[];
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export function createSuccessResponse<T = any>(
  message: string,
  data?: T,
  meta?: any
): ApiResponse<T> {
  return {
    success: true,
    message,
    data: data ?? ({} as T),
    meta: meta ?? null,
  };
}

export function createErrorResponse(
  message: string,
  errors: ApiFieldError[] = []
): ApiResponse {
  return {
    success: false,
    message,
    errors,
  };
}
