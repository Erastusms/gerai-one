import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import rawBody from 'fastify-raw-body';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import { errorHandlerPlugin, requestLoggerPlugin } from './shared/plugins';
import { authRoutes } from './modules/auth/auth.route';
import { adminAuthRoutes } from './modules/admin-auth/admin-auth.route';
import { userRoutes } from './modules/user/user.route';
import { addressRoutes } from './modules/address/address.route';
import { categoryRoutes } from './modules/category/category.route';
import { productRoutes } from './modules/product/product.route';
import { brandRoutes } from './modules/brand/brand.route';
import { reviewRoutes } from './modules/review/review.route';
import { wishlistRoutes } from './modules/wishlist/wishlist.route';
import { cartRoutes } from './modules/cart/cart.route';
import { inventoryRoutes } from './modules/inventory/inventory.route';
import { checkoutRoutes } from './modules/checkout/checkout.route';
import { shippingRoutes } from './modules/shipping/shipping.route';
import { dashboardRoutes } from './modules/dashboard/dashboard.route';
import { adminUserRoutes } from './modules/admin-user/admin-user.route';
import { adminCatalogRoutes } from './modules/admin-catalog/admin-catalog.route';
import { marketingRoutes } from './modules/marketing/marketing.route';
import { z } from 'zod';
import { prisma } from './shared/database';

export const app = fastify({
  // Disable default fastify logger because we use our custom request-logger plugin
  logger: false,
  // Generate request IDs automatically
  requestIdHeader: 'x-request-id',
});


// Configure Zod Type Provider compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register raw body parser (global: false to only capture raw body where explicitly configured)
app.register(rawBody, {
  field: 'rawBody',
  global: false,
  encoding: 'utf8',
  runFirst: true,
});

// Register CORS
app.register(cors, {
  origin: true, // Allow all origins for development, can be configured for production
  credentials: true,
});

// Register Cookies
app.register(fastifyCookie);

// Register OpenAPI/Swagger Plugin
app.register(swagger, {
  openapi: {
    info: {
      title: 'GeraiOne API Platform',
      description: 'Scaleable backend services for GeraiOne ecommerce platform',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter Clerk session JWT token: Bearer <token>',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

// Register Swagger UI plugin
app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

// Register global custom plugins
app.register(errorHandlerPlugin);
app.register(requestLoggerPlugin);

// Health check endpoint
app.get(
  "/health",
  {
    schema: {
      description: "Check the API and database health status",
      tags: ["Health"],
      summary: "API Health Check",
      response: {
        200: z.object({
          status: z.string(),
          database: z.string(),
          timestamp: z.string(),
        }),
        500: z.object({
          status: z.string(),
          database: z.string(),
          timestamp: z.string(),
        }),
      },
    },
  },
  async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: "UP",
        database: "CONNECTED",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return reply.status(500).send({
        status: "DOWN",
        database: "DISCONNECTED",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Register feature routes
app.register(authRoutes);
app.register(adminAuthRoutes);
app.register(userRoutes);
app.register(addressRoutes);
app.register(categoryRoutes);
app.register(productRoutes);
app.register(brandRoutes);
app.register(reviewRoutes);
app.register(wishlistRoutes);
app.register(cartRoutes);
app.register(inventoryRoutes);
app.register(checkoutRoutes);
app.register(shippingRoutes);
app.register(dashboardRoutes);
app.register(adminUserRoutes);
app.register(adminCatalogRoutes);
app.register(marketingRoutes, { prefix: "/api/v1" });
