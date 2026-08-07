import { database } from "./config/database";
import { env } from "./config/env";

let prepareBackendPromise: Promise<void> | null = null;

const initializeBackend = async (): Promise<void> => {
  const databaseConnected = await database.connect();

  if (!databaseConnected) {
    console.log("Backend is running without database connection.");
    return;
  }

  if (!env.database.autoSync) {
    console.log("Database auto sync is disabled for this environment.");
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
