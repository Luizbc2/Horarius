import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { AppointmentsController } from "../controllers/appointments.controller";
import { authorizePermission } from "../../auth/middlewares/authorize-permission.middleware";

const appointmentsRoutes = Router();
const appointmentsController = new AppointmentsController();

appointmentsRoutes.use(authenticate);

appointmentsRoutes.get("/", authorizePermission("appointments:read"), (request, response) =>
  appointmentsController.list(request, response),
);
appointmentsRoutes.post("/", authorizePermission("appointments:write"), (request, response) =>
  appointmentsController.create(request, response),
);
appointmentsRoutes.post("/swap", authorizePermission("appointments:write"), (request, response) =>
  appointmentsController.swap(request, response),
);
appointmentsRoutes.put("/:id", authorizePermission("appointments:write"), (request, response) =>
  appointmentsController.update(request, response),
);
appointmentsRoutes.delete("/:id", authorizePermission("appointments:write"), (request, response) =>
  appointmentsController.delete(request, response),
);

export { appointmentsRoutes };
