import { app } from "./app";
import { env } from "./config/env";
import { prepareBackend } from "./bootstrap";

const startServer = async (): Promise<void> => {
  try {
    await prepareBackend();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}.`);
    });
  } catch (error) {
    console.error("Failed to start backend.", error);
    process.exit(1);
  }
};

startServer();
