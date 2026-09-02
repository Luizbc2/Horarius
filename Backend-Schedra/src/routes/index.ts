import { Router } from "express";

import { HealthController } from "../controllers/health.controller";
import { appointmentsRoutes } from "../modules/appointments/routes/appointments.routes";
import { authRoutes } from "../modules/auth/routes/auth.routes";
import { clientsRoutes } from "../modules/clients/routes/clients.routes";
import { professionalsRoutes } from "../modules/professionals/routes/professionals.routes";
import { servicesRoutes } from "../modules/services/routes/services.routes";
import { usersRoutes } from "../modules/users/routes/users.routes";
import { personalEventsRoutes } from "../modules/personal-events/routes/personal-events.routes";
import { adminRoutes } from "../modules/admin/routes/admin.routes";
import { organizationsRoutes } from "../modules/organizations/routes/organizations.routes";

const router = Router();
const healthController = new HealthController();

router.get("/health", (request, response) => healthController.check(request, response));
router.use("/admin", adminRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/auth", authRoutes);
router.use("/clients", clientsRoutes);
router.use("/professionals", professionalsRoutes);
router.use("/services", servicesRoutes);
router.use("/users", usersRoutes);
router.use("/personal-events", personalEventsRoutes);
router.use("/organizations", organizationsRoutes);

export { router };
