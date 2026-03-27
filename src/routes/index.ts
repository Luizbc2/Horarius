import { Router } from "express";

import { HealthController } from "../controllers/health.controller";
import { authRoutes } from "../modules/auth/routes/auth.routes";

const router = Router();
const healthController = new HealthController();

router.get("/health", (request, response) => healthController.check(request, response));
router.use("/auth", authRoutes);

export { router };
