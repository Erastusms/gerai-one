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
    const user = await prisma.user.findFirst({
      where: {
        clerkId,
        deletedAt: null,
      },
    });

    if (!user) {
      logger.warn({ clerkId }, "JWT verification succeeded but local user was not found");
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
