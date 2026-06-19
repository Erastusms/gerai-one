import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { HttpException } from "../exceptions";
import { createErrorResponse } from "../responses";
import { logger } from "../logger";

const errorHandlerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error, request, reply) => {
    // 1. Handle custom HttpExceptions
    if (error instanceof HttpException) {
      return reply
        .status(error.statusCode)
        .send(createErrorResponse(error.message, error.errors));
    }

    // 2. Handle Zod validation errors directly
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return reply
        .status(400)
        .send(createErrorResponse("Validation error", fieldErrors));
    }

    // 3. Handle validation errors wrapped by Fastify (fastify-type-provider-zod / ajv)
    if (error.validation) {
      const fieldErrors = (error as any).validation.map((issue: any) => {
        // Handle path extraction depending on validator type (Zod vs standard AJV)
        let field = "unknown";
        if (issue.instancePath) {
          field = issue.instancePath.replace(/^\//, "").replace(/\//g, ".");
        } else if (issue.params?.missingProperty) {
          field = issue.params.missingProperty;
        } else if (issue.path) {
          field = Array.isArray(issue.path) ? issue.path.join(".") : issue.path;
        }
        return {
          field,
          message: issue.message || "Invalid value",
        };
      });
      return reply
        .status(400)
        .send(createErrorResponse("Validation error", fieldErrors));
    }

    // 4. Handle other Fastify native/HTTP errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? "Internal server error" : error.message;

    // Log actual 500 errors
    if (statusCode === 500) {
      logger.error({
        err: error,
        url: request.url,
        method: request.method,
      }, "Unhandled internal server error");
    }

    return reply
      .status(statusCode)
      .send(createErrorResponse(message));
  });
});

export default errorHandlerPlugin;
