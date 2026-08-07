import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { ServicesController } from "../controllers/services.controller";

const servicesRoutes = Router();
const servicesController = new ServicesController();

servicesRoutes.use(authenticate);

servicesRoutes.get("/:id", (request, response) => servicesController.getById(request, response));
servicesRoutes.get("/", (request, response) => servicesController.list(request, response));
servicesRoutes.post("/", (request, response) => servicesController.create(request, response));
servicesRoutes.put("/:id", (request, response) => servicesController.update(request, response));
servicesRoutes.delete("/:id", (request, response) => servicesController.delete(request, response));

export { servicesRoutes };
