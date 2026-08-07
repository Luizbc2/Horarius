import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { AppointmentsController } from "../controllers/appointments.controller";

const appointmentsRoutes = Router();
const appointmentsController = new AppointmentsController();

appointmentsRoutes.use(authenticate);

appointmentsRoutes.get("/", (request, response) =>
  appointmentsController.list(request, response),
);
appointmentsRoutes.post("/", (request, response) =>
  appointmentsController.create(request, response),
);
appointmentsRoutes.put("/:id", (request, response) =>
  appointmentsController.update(request, response),
);
appointmentsRoutes.delete("/:id", (request, response) =>
  appointmentsController.delete(request, response),
);

export { appointmentsRoutes };
