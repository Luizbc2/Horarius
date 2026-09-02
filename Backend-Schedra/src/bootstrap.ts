import { database } from "./config/database";
import { assertProductionEnvironment, env } from "./config/env";

let prepareBackendPromise: Promise<void> | null = null;

const initializeBackend = async (): Promise<void> => {
  assertProductionEnvironment();
  const databaseConnected = await database.connect();

  if (!databaseConnected) {
    if (env.nodeEnv === "production") {
      throw new Error("Database connection is required in production.");
    }
    console.log("Backend is running without database connection.");
    return;
  }

  if (!env.database.autoSync) {
    await database.migrate();
    console.log("Database migrations applied; automatic table creation is disabled.");
    return;
  }

  await database.synchronize();
};

export const prepareBackend = async (): Promise<void> => {
  if (!prepareBackendPromise) {
    prepareBackendPromise = initializeBackend().catch((error) => {
      prepareBackendPromise = null;
      throw error;
    });
  }

  await prepareBackendPromise;
};
