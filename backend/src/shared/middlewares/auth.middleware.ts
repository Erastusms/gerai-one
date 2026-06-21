import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "@clerk/backend";
import { config } from "../config";
import { prisma } from "../database";
import { UnauthorizedException } from "../exceptions";
import { logger } from "../logger";

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException("Missing or invalid authorization token format");
  }

  const token = authHeader.substring(7);

  try {
    const decoded = await verifyToken(token, {
      secretKey: config.CLERK_SECRET_KEY,
    });

    const clerkId = decoded.sub;

    if (!clerkId) {
      throw new UnauthorizedException("Token subject claim is missing");
    }

    // Retrieve active local user from database
    let user = await prisma.user.findFirst({
      where: {
        clerkId,
        deletedAt: null,
      },
    });

    if (!user) {
      logger.info({ clerkId }, "JWT verification succeeded but local user was not found. Attempting auto-provisioning via Clerk API...");
      try {
        const { createClerkClient } = require("@clerk/backend");
        const clerkClient = createClerkClient({ secretKey: config.CLERK_SECRET_KEY });
        const clerkUser = await clerkClient.users.getUser(clerkId);

        if (clerkUser) {
          const emailObj = clerkUser.emailAddresses?.find((e: any) => e.id === clerkUser.primaryEmailAddressId) || clerkUser.emailAddresses?.[0];
          const email = emailObj?.emailAddress;

          if (email) {
            const firstName = clerkUser.firstName || null;
            const lastName = clerkUser.lastName || null;
            const fullName = firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || null;
            const imageUrl = clerkUser.imageUrl || null;

            const phoneObj = clerkUser.phoneNumbers?.find((p: any) => p.id === clerkUser.primaryPhoneNumberId) || clerkUser.phoneNumbers?.[0];
            const phoneNumber = phoneObj?.phoneNumber || null;

            user = await prisma.user.create({
              data: {
                clerkId,
                email,
                firstName,
                lastName,
                fullName,
                imageUrl,
                phoneNumber,
                status: "ACTIVE",
              },
            });
            logger.info({ clerkId, userId: user.id }, "Successfully auto-provisioned user locally from Clerk");
          } else {
            logger.warn({ clerkId }, "Clerk user profile does not contain an email address");
          }
        }
      } catch (provisionError) {
        logger.error({ provisionError }, "Failed to auto-provision user from Clerk");
      }
    }

    if (!user) {
      logger.warn({ clerkId }, "JWT verification succeeded but local user was not found and auto-provisioning failed");
      throw new UnauthorizedException("User not authenticated locally");
    }

    if (user.status !== "ACTIVE") {
      logger.warn({ clerkId, userId: user.id }, "Authenticated user account is inactive");
      throw new UnauthorizedException("User account is disabled");
    }

    // Attach local user object to request
    request.user = user;
  } catch (error) {
    logger.error({ error }, "Clerk authentication token verification failed");
    throw new UnauthorizedException(
      error instanceof Error ? error.message : "Invalid authentication credentials"
    );
  }
}
