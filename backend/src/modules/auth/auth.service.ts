import { Webhook } from "svix";
import { authRepository } from "./auth.repository";
import { config } from "../../shared/config";
import { UnauthorizedException, ConflictException } from "../../shared/exceptions";
import { logger } from "../../shared/logger";
import { User, Prisma } from "@prisma/client";

export class AuthService {
  // Verifies raw Clerk webhook payloads using Svix
  verifyWebhook(
    rawBody: string,
    headers: Record<string, string>
  ): { type: string; data: any } {
    const svixId = headers["svix-id"];
    const svixTimestamp = headers["svix-timestamp"];
    const svixSignature = headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new UnauthorizedException("Missing webhook signature headers");
    }

    try {
      const wh = new Webhook(config.CLERK_WEBHOOK_SECRET);
      const payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;

      return {
        type: payload.type,
        data: payload.data,
      };
    } catch (error) {
      logger.error({ error }, "Webhook signature validation failed");
      throw new UnauthorizedException("Invalid webhook signature");
    }
  }

  // Processes Clerk events to sync users locally
  async syncClerkUser(type: string, data: any): Promise<User | null> {
    const clerkId = data.id;

    if (!clerkId) {
      throw new UnauthorizedException("Missing clerk ID in webhook payload");
    }

    logger.info({ type, clerkId }, "Syncing Clerk user event");

    if (type === "user.created" || type === "user.updated") {
      // Extract email address
      const emailAddresses = data.email_addresses || [];
      const primaryEmailId = data.primary_email_address_id;
      const primaryEmailObj = emailAddresses.find((e: any) => e.id === primaryEmailId);
      const email = primaryEmailObj?.email_address || emailAddresses[0]?.email_address;

      if (!email) {
        throw new ConflictException("User payload does not contain an email address");
      }

      // Extract phone number
      const phoneNumbers = data.phone_numbers || [];
      const primaryPhoneId = data.primary_phone_number_id;
      const primaryPhoneObj = phoneNumbers.find((p: any) => p.id === primaryPhoneId);
      const phoneNumber = primaryPhoneObj?.phone_number || phoneNumbers[0]?.phone_number || null;

      const firstName = data.first_name || null;
      const lastName = data.last_name || null;
      const fullName = firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || null;
      const imageUrl = data.image_url || data.profile_image_url || null;

      const dbPayload: Prisma.UserCreateInput = {
        clerkId,
        email,
        firstName,
        lastName,
        fullName,
        imageUrl,
        phoneNumber,
        status: "ACTIVE",
        deletedAt: null,
      };

      logger.info({ clerkId }, "Performing idempotent upsert for user");
      return authRepository.upsertUserByClerkId(clerkId, dbPayload);
    }

    if (type === "user.deleted") {
      const existingUser = await authRepository.findByClerkId(clerkId);
      if (!existingUser) {
        logger.warn({ clerkId }, "User requested for deletion does not exist locally");
        return null;
      }
      logger.info({ clerkId }, "Soft deleting local user");
      return authRepository.softDeleteByClerkId(clerkId);
    }

    logger.warn({ type }, "Unsupported Clerk webhook event type received");
    return null;
  }
}
export const authService = new AuthService();
