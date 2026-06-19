import { app } from "./app";
import { config } from "./shared/config";
import { connectDb, disconnectDb } from "./shared/database";
import { logger } from "./shared/logger";

async function start() {
  try {
    // 1. Connect database
    logger.info("Connecting to PostgreSQL database...");
    await connectDb();
    logger.info("Database connected successfully.");

    // 2. Start fastify server
    logger.info(`Starting server on ${config.HOST}:${config.PORT}...`);
    await app.listen({
      port: config.PORT,
      host: "0.0.0.0", // listen on all network interfaces (important for docker/production compatibility)
    });
    logger.info(`🚀 Server listening at http://localhost:${config.PORT}`);
    logger.info(`📄 Swagger documentation available at http://localhost:${config.PORT}/docs`);
  } catch (error) {
    logger.error({ error }, "Fatal error during startup bootstrap");
    process.exit(1);
  }
}

// Graceful teardown handlers
const signals = ["SIGTERM", "SIGINT"] as const;
for (const signal of signals) {
  process.on(signal, async () => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      await disconnectDb();
      logger.info("Graceful shutdown complete.");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during graceful shutdown");
      process.exit(1);
    }
  });
}

start();
