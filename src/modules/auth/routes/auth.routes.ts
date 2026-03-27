import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { InMemoryUserRepository } from "../repositories/in-memory-user.repository";
import { LoginService } from "../services/login.service";

const authRoutes = Router();
const userRepository = new InMemoryUserRepository();
const loginService = new LoginService(userRepository);
const authController = new AuthController(loginService);

authRoutes.post("/login", (request, response) => authController.login(request, response));

export { authRoutes };
