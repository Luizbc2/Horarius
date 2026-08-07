import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { SequelizeUserRepository } from "../repositories/sequelize-user.repository";
import { LoginService } from "../services/login.service";

const authRoutes = Router();
const userRepository = new SequelizeUserRepository();
const loginService = new LoginService(userRepository);
const authController = new AuthController(loginService);

authRoutes.post("/login", (request, response) => authController.login(request, response));

export { authRoutes };
