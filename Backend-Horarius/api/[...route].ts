import type { IncomingMessage, ServerResponse } from "http";

import app from "../src/app";
import { prepareBackend } from "../src/bootstrap";

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  await prepareBackend();
  return app(request as never, response as never);
}
