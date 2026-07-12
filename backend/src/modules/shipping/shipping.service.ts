import { shippingRepository } from "./shipping.repository";
import { CreateShippingServiceInput, UpdateShippingServiceInput } from "./shipping.schema";
import { NotFoundException, ConflictException } from "../../shared/exceptions";

export class ShippingService {
  private mapResponse(service: any) {
    if (!service) return null;
    return {
      ...service,
      defaultPrice: Number(service.defaultPrice),
    };
  }

  async getActiveShippingServices() {
    const services = await shippingRepository.findAll({ isActive: true });
    return services.map(this.mapResponse);
  }

  async getAdminShippingServices() {
    const services = await shippingRepository.findAll();
    return services.map(this.mapResponse);
  }

  async createShippingService(input: CreateShippingServiceInput) {
    // Check code unique constraint
    const existing = await shippingRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictException(`Shipping service with code "${input.code}" already exists`);
    }

    const created = await shippingRepository.create({
      code: input.code,
      name: input.name,
      description: input.description,
      estimatedDeliveryMinDay: input.estimatedDeliveryMinDay,
      estimatedDeliveryMaxDay: input.estimatedDeliveryMaxDay,
      defaultPrice: input.defaultPrice,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    });

    return this.mapResponse(created);
  }

  async updateShippingService(id: string, input: UpdateShippingServiceInput) {
    const service = await shippingRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Shipping service with ID "${id}" not found`);
    }

    if (input.code && input.code !== service.code) {
      const existing = await shippingRepository.findByCode(input.code);
      if (existing) {
        throw new ConflictException(`Shipping service with code "${input.code}" already exists`);
      }
    }

    const updated = await shippingRepository.update(id, {
      code: input.code,
      name: input.name,
      description: input.description,
      estimatedDeliveryMinDay: input.estimatedDeliveryMinDay,
      estimatedDeliveryMaxDay: input.estimatedDeliveryMaxDay,
      defaultPrice: input.defaultPrice,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    });

    return this.mapResponse(updated);
  }

  async updateStatus(id: string, isActive: boolean) {
    const service = await shippingRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Shipping service with ID "${id}" not found`);
    }

    const updated = await shippingRepository.update(id, { isActive });
    return this.mapResponse(updated);
  }
}

export const shippingService = new ShippingService();
