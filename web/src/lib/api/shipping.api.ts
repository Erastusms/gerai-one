import { apiClient } from "./client";
import { ApiResponse } from "@/types";

export interface ShippingServiceData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  estimatedDeliveryMinDay: number;
  estimatedDeliveryMaxDay: number;
  defaultPrice: number;
  displayOrder: number;
  isActive: boolean;
}

export const shippingApi = {
  async getActiveShippingServices(): Promise<ApiResponse<ShippingServiceData[]>> {
    const response = await apiClient.get<ApiResponse<ShippingServiceData[]>>("/api/v1/shipping-services");
    return response.data;
  },
};
