import { addressRepository } from "./address.repository";
import { CreateAddressInput, UpdateAddressInput } from "./address.schema";
import { NotFoundException, ForbiddenException } from "../../shared/exceptions";
import { Address } from "@prisma/client";

export class AddressService {
  // Get all active addresses for a user
  async listAddresses(userId: string): Promise<Address[]> {
    return addressRepository.findManyByUserId(userId);
  }

  // Create a new address
  async createAddress(userId: string, input: CreateAddressInput): Promise<Address> {
    const activeCount = await addressRepository.countActiveByUser(userId);
    
    // Rule: First address must be default, or if payload sets it default
    const shouldBeDefault = activeCount === 0 || input.isDefault === true;

    if (shouldBeDefault) {
      await addressRepository.unsetDefaultsForUser(userId);
    }

    return addressRepository.create({
      user: { connect: { id: userId } },
      label: input.label,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      province: input.province,
      city: input.city,
      district: input.district,
      subDistrict: input.subDistrict,
      postalCode: input.postalCode,
      fullAddress: input.fullAddress,
      notes: input.notes,
      isDefault: shouldBeDefault,
      isDeleted: false,
    });
  }

  // Update address
  async updateAddress(userId: string, addressId: string, input: UpdateAddressInput): Promise<Address> {
    const address = await addressRepository.findById(addressId);
    if (!address || address.isDeleted) {
      throw new NotFoundException("Address not found");
    }

    if (address.userId !== userId) {
      throw new ForbiddenException("You do not have access to this address");
    }

    if (input.isDefault === true) {
      await addressRepository.unsetDefaultsForUser(userId);
    } else if (input.isDefault === false && address.isDefault) {
      // If user tries to unset default, prevent it or enforce at least one default
      // In B2C, we require at least one default address if addresses exist.
      // So keep it default or throw an error. Let's make it remain default.
      input.isDefault = true;
    }

    return addressRepository.update(addressId, input);
  }

  // Soft delete address
  async deleteAddress(userId: string, addressId: string): Promise<Address> {
    const address = await addressRepository.findById(addressId);
    if (!address || address.isDeleted) {
      throw new NotFoundException("Address not found");
    }

    if (address.userId !== userId) {
      throw new ForbiddenException("You do not have access to this address");
    }

    // Soft delete the address
    const updated = await addressRepository.update(addressId, {
      isDeleted: true,
      isDefault: false,
    });

    // Rule: If we deleted the default address, automatically set another one as default
    if (address.isDefault) {
      const remaining = await addressRepository.findManyByUserId(userId);
      if (remaining.length > 0) {
        await addressRepository.update(remaining[0].id, {
          isDefault: true,
        });
      }
    }

    return updated;
  }

  // Set default address
  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const address = await addressRepository.findById(addressId);
    if (!address || address.isDeleted) {
      throw new NotFoundException("Address not found");
    }

    if (address.userId !== userId) {
      throw new ForbiddenException("You do not have access to this address");
    }

    // Unset all defaults first
    await addressRepository.unsetDefaultsForUser(userId);

    // Set this one as default
    return addressRepository.update(addressId, {
      isDefault: true,
    });
  }
}

export const addressService = new AddressService();
