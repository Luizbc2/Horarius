import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { ClientsController } from "../controllers/clients.controller";

const clientsRoutes = Router();
const clientsController = new ClientsController();

clientsRoutes.use(authenticate);

clientsRoutes.get("/:id", (request, response) => clientsController.getById(request, response));
clientsRoutes.get("/", (request, response) => clientsController.list(request, response));
clientsRoutes.post("/", (request, response) => clientsController.create(request, response));
clientsRoutes.put("/:id", (request, response) => clientsController.update(request, response));
clientsRoutes.delete("/:id", (request, response) => clientsController.delete(request, response));

export { clientsRoutes };
