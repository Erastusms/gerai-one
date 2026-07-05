import { z } from "zod";

export const addressLabelSchema = z.enum(["Home", "Office", "Apartment", "Other"]);

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  recipientName: z.string().min(1).max(100),
  recipientPhone: z.string().min(1).max(20),
  province: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  subDistrict: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(10),
  fullAddress: z.string().min(1),
  notes: z.string().max(255).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export const addressResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string(),
  recipientName: z.string(),
  recipientPhone: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  subDistrict: z.string(),
  postalCode: z.string(),
  fullAddress: z.string(),
  notes: z.string().nullable(),
  isDefault: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AddressResponse = z.infer<typeof addressResponseSchema>;
