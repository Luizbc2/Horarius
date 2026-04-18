import app from "../src/app";
import { prepareBackend } from "../src/bootstrap";

export default async function handler(request: Parameters<typeof app>[0], response: Parameters<typeof app>[1]) {
  try {
    await prepareBackend();
  } catch (error) {
    console.error("Backend preparation failed in Vercel handler.", error);
  }

  return app(request, response);
}
