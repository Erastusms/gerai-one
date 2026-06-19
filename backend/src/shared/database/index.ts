import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export async function connectDb() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
