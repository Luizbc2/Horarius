import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { ClientsController } from "../controllers/clients.controller";
import { authorizePermission } from "../../auth/middlewares/authorize-permission.middleware";

const clientsRoutes = Router();
const clientsController = new ClientsController();

clientsRoutes.use(authenticate);

clientsRoutes.get("/:id", authorizePermission("clients:read"), (request, response) => clientsController.getById(request, response));
clientsRoutes.get("/", authorizePermission("clients:read"), (request, response) => clientsController.list(request, response));
clientsRoutes.post("/", authorizePermission("clients:write"), (request, response) => clientsController.create(request, response));
clientsRoutes.put("/:id", authorizePermission("clients:write"), (request, response) => clientsController.update(request, response));
clientsRoutes.delete("/:id", authorizePermission("clients:write"), (request, response) => clientsController.delete(request, response));

export { clientsRoutes };
