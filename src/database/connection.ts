import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../shared/logger.js";

mongoose.set("bufferCommands", false);

export function databaseStatus():
  "connected" | "disconnected" | "unconfigured" {
  if (!env.MONGODB_URI) return "unconfigured";
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}

export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    logger.warn("MongoDB is unconfigured; database features are unavailable");
    return;
  }
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  logger.info("MongoDB connected");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
