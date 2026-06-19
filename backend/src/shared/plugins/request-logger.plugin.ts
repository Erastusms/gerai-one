import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { logger } from "../logger";

const requestLoggerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", async (request) => {
    (request as any).startTime = process.hrtime();
  });

  fastify.addHook("onResponse", async (request, reply) => {
    const startTime = (request as any).startTime;
    let executionTime = 0;
    if (startTime) {
      const diff = process.hrtime(startTime);
      executionTime = diff[0] * 1e3 + diff[1] * 1e-6; // in milliseconds
    }

    const { id: requestId, method, url: endpoint } = request;
    const statusCode = reply.statusCode;
    const userId = request.user?.id || null;

    logger.info({
      requestId,
      userId,
      endpoint,
      method,
      executionTime: `${executionTime.toFixed(2)}ms`,
      statusCode,
      timestamp: new Date().toISOString(),
    }, "Request completed");
  });
});

export default requestLoggerPlugin;
