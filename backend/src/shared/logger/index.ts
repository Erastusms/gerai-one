import pino from "pino";
import { config } from "../config";

export interface Logger {
  info(msg: string): void;
  info(obj: object, msg?: string): void;
  error(msg: string): void;
  error(obj: object, msg?: string): void;
  warn(msg: string): void;
  warn(obj: object, msg?: string): void;
  debug(msg: string): void;
  debug(obj: object, msg?: string): void;
}

const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

const pinoInstance = pino({
  level: config.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logger: Logger = {
  info(arg1: any, arg2?: string) {
    if (typeof arg1 === "string") {
      pinoInstance.info(arg1);
    } else {
      pinoInstance.info(arg1, arg2);
    }
  },
  error(arg1: any, arg2?: string) {
    if (typeof arg1 === "string") {
      pinoInstance.error(arg1);
    } else {
      pinoInstance.error(arg1, arg2);
    }
  },
  warn(arg1: any, arg2?: string) {
    if (typeof arg1 === "string") {
      pinoInstance.warn(arg1);
    } else {
      pinoInstance.warn(arg1, arg2);
    }
  },
  debug(arg1: any, arg2?: string) {
    if (typeof arg1 === "string") {
      pinoInstance.debug(arg1);
    } else {
      pinoInstance.debug(arg1, arg2);
    }
  },
};
