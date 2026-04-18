import { App } from "./app";
import { database } from "./config/database";
import { env } from "./config/env";

const app = new App();

const startServer = async (): Promise<void> => {
  try {
    const databaseConnected = await database.connect();

    if (databaseConnected) {
      await database.synchronize();
    }

    app.server.listen(env.port, () => {
      if (!databaseConnected) {
        console.log("Server started without database connection.");
      }

      console.log(`Server running on port ${env.port}.`);
    });
  } catch (error) {
    console.error("Failed to start backend.", error);
    process.exit(1);
  }
};

startServer();
