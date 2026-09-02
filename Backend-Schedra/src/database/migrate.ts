import { database } from "../config/database";

const run = async (): Promise<void> => {
  const connected = await database.connect();
  if (!connected) throw new Error("Database connection is required to run migrations.");
  await database.migrate();
  await database.close();
};

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
