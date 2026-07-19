import type { CustomerProfile } from "@/types";

export const customerProfile: CustomerProfile = {
  id: "cust_01J7X9K2M4N5P6Q8R0S1T2U3V4",
  clerkUserId: "user_123",
  email: "sarah.anderson@email.com",
  fullName: "Sarah Anderson",
  username: "sarah",
  phoneNumber: "+1 (555) 123-4567",
  gender: "Female",
  dateOfBirth: "1995-03-15",
  profilePhoto: "https://i.pravatar.cc/120?u=sarah",
  isProfileCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
