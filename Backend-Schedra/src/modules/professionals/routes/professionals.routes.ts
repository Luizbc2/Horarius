import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { ProfessionalsController } from "../controllers/professionals.controller";
import { authorizePermission } from "../../auth/middlewares/authorize-permission.middleware";

const professionalsRoutes = Router();
const professionalsController = new ProfessionalsController();

professionalsRoutes.use(authenticate);

professionalsRoutes.get("/:id", authorizePermission("professionals:read"), (request, response) => professionalsController.getById(request, response));
professionalsRoutes.get("/", authorizePermission("professionals:read"), (request, response) => professionalsController.list(request, response));
professionalsRoutes.post("/", authorizePermission("professionals:write"), (request, response) => professionalsController.create(request, response));
professionalsRoutes.get("/:id/work-days", authorizePermission("professionals:read"), (request, response) =>
  professionalsController.listWorkDays(request, response),
);
professionalsRoutes.put("/:id", authorizePermission("professionals:write"), (request, response) => professionalsController.update(request, response));
professionalsRoutes.put("/:id/work-days", authorizePermission("professionals:write"), (request, response) =>
  professionalsController.updateWorkDays(request, response),
);
professionalsRoutes.delete("/:id", authorizePermission("professionals:write"), (request, response) => professionalsController.delete(request, response));

export { professionalsRoutes };
