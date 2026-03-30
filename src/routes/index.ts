import { Router } from "express";

import { HealthController } from "../controllers/health.controller";
import { authRoutes } from "../modules/auth/routes/auth.routes";
import { clientsRoutes } from "../modules/clients/routes/clients.routes";
import { servicesRoutes } from "../modules/services/routes/services.routes";
import { usersRoutes } from "../modules/users/routes/users.routes";

const router = Router();
const healthController = new HealthController();

router.get("/health", (request, response) => healthController.check(request, response));
router.use("/auth", authRoutes);
router.use("/clients", clientsRoutes);
router.use("/services", servicesRoutes);
router.use("/users", usersRoutes);

export { router };
