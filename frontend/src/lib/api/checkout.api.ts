import { apiClient } from "./client";
import { ApiResponse } from "@/types";

export interface CheckoutItemInput {
  productVariantId: string;
  price: number;
  discountPrice: number | null;
}

export interface CheckoutItemData {
  id: string;
  checkoutSessionId: string;
  productVariantId: string;
  productName: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  thumbnailUrl: string | null;
  productVariant?: any;
}

export interface CheckoutSessionData {
  id: string;
  userId: string;
  orderNumber: string;
  status: "PENDING" | "EXPIRED" | "COMPLETED" | "CANCELLED";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  shippingLabel?: string | null;
  shippingRecipientName?: string | null;
  shippingRecipientPhone?: string | null;
  shippingProvince?: string | null;
  shippingCity?: string | null;
  shippingDistrict?: string | null;
  shippingSubDistrict?: string | null;
  shippingPostalCode?: string | null;
  shippingFullAddress?: string | null;
  shippingNotes?: string | null;
  shippingServiceId?: string | null;
  shippingServiceName?: string | null;
  shippingServiceDescription?: string | null;
  shippingEstimatedDelivery?: string | null;
  shippingFee?: number | null;
  items: CheckoutItemData[];
}

export interface CreateCheckoutResponse {
  session: CheckoutSessionData;
  warnings: Array<{
    type: "PRICE_CHANGED" | "DISCOUNT_CHANGED";
    message: string;
  }>;
}

export const checkoutApi = {
  async createCheckout(items?: CheckoutItemInput[]): Promise<ApiResponse<CreateCheckoutResponse>> {
    const response = await apiClient.post<ApiResponse<CreateCheckoutResponse>>("/api/v1/checkout", { items });
    return response.data;
  },

  async getCheckouts(): Promise<ApiResponse<CheckoutSessionData[]>> {
    const response = await apiClient.get<ApiResponse<CheckoutSessionData[]>>("/api/v1/checkout");
    return response.data;
  },

  async getCheckout(idOrOrderNumber: string): Promise<ApiResponse<CheckoutSessionData>> {
    const response = await apiClient.get<ApiResponse<CheckoutSessionData>>(`/api/v1/checkout/${idOrOrderNumber}`);
    return response.data;
  },

  async cancelCheckout(idOrOrderNumber: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/checkout/${idOrOrderNumber}`);
    return response.data;
  },

  async updateCheckoutAddress(orderNumber: string, addressId: string): Promise<ApiResponse<CheckoutSessionData>> {
    const response = await apiClient.patch<ApiResponse<CheckoutSessionData>>(`/api/v1/checkout/${orderNumber}/address`, { addressId });
    return response.data;
  },

  async updateShippingService(orderNumber: string, shippingServiceId: string): Promise<ApiResponse<CheckoutSessionData>> {
    const response = await apiClient.patch<ApiResponse<CheckoutSessionData>>(`/api/v1/checkout/${orderNumber}/shipping-service`, { shippingServiceId });
    return response.data;
  },
};
