import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { SequelizeUserRepository } from "../repositories/sequelize-user.repository";
import { LoginService } from "../services/login.service";
import { tenantService } from "../../../platform/tenancy/tenant.service";
import { sessionService } from "../services/session.service";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../../../shared/http/request-context";

const authRoutes = Router();
const userRepository = new SequelizeUserRepository();
const loginService = new LoginService(userRepository, tenantService, sessionService);
const authController = new AuthController(loginService, sessionService);

authRoutes.post("/login", asyncHandler((request, response) => authController.login(request, response)));
authRoutes.post("/refresh", asyncHandler((request, response) => authController.refresh(request, response)));
authRoutes.post("/logout", authenticate, asyncHandler((request, response) => authController.logout(request, response)));

export { authRoutes };
