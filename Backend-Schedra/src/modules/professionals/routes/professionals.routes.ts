import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { ProfessionalsController } from "../controllers/professionals.controller";

const professionalsRoutes = Router();
const professionalsController = new ProfessionalsController();

professionalsRoutes.use(authenticate);

professionalsRoutes.get("/:id", (request, response) => professionalsController.getById(request, response));
professionalsRoutes.get("/", (request, response) => professionalsController.list(request, response));
professionalsRoutes.post("/", (request, response) => professionalsController.create(request, response));
professionalsRoutes.get("/:id/work-days", (request, response) =>
  professionalsController.listWorkDays(request, response),
);
professionalsRoutes.put("/:id", (request, response) => professionalsController.update(request, response));
professionalsRoutes.put("/:id/work-days", (request, response) =>
  professionalsController.updateWorkDays(request, response),
);
professionalsRoutes.delete("/:id", (request, response) => professionalsController.delete(request, response));

export { professionalsRoutes };
