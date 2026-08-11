import { Router } from "express";
import { authenticate } from "../../auth/middlewares/auth.middleware";
import { PersonalEventsController } from "../controllers/personal-events.controller";

const personalEventsRoutes = Router();
const controller = new PersonalEventsController();
personalEventsRoutes.use(authenticate);
personalEventsRoutes.get("/", (request, response) => controller.list(request, response));
personalEventsRoutes.post("/", (request, response) => controller.create(request, response));
personalEventsRoutes.put("/:id", (request, response) => controller.update(request, response));
personalEventsRoutes.delete("/:id", (request, response) => controller.delete(request, response));
export { personalEventsRoutes };
