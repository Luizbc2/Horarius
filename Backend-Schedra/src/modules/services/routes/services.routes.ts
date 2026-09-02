import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { ServicesController } from "../controllers/services.controller";
import { authorizePermission } from "../../auth/middlewares/authorize-permission.middleware";

const servicesRoutes = Router();
const servicesController = new ServicesController();

servicesRoutes.use(authenticate);

servicesRoutes.get("/:id", authorizePermission("services:read"), (request, response) => servicesController.getById(request, response));
servicesRoutes.get("/", authorizePermission("services:read"), (request, response) => servicesController.list(request, response));
servicesRoutes.post("/", authorizePermission("services:write"), (request, response) => servicesController.create(request, response));
servicesRoutes.put("/:id", authorizePermission("services:write"), (request, response) => servicesController.update(request, response));
servicesRoutes.delete("/:id", authorizePermission("services:write"), (request, response) => servicesController.delete(request, response));

export { servicesRoutes };
