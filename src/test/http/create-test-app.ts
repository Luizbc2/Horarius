import cors from "cors";
import express from "express";

import { env } from "../../config/env";
import { HealthController } from "../../controllers/health.controller";
import { AuthController } from "../../modules/auth/controllers/auth.controller";
import { authenticate } from "../../modules/auth/middlewares/auth.middleware";
import { UserRepository } from "../../modules/auth/repositories/user.repository";
import { LoginService } from "../../modules/auth/services/login.service";
import { UsersController } from "../../modules/users/controllers/users.controller";
import { CreateUserService } from "../../modules/users/services/create-user.service";
import { UpdateUserProfileService } from "../../modules/users/services/update-user-profile.service";

export function createTestApp(userRepository: UserRepository) {
  const app = express();
  const healthController = new HealthController();
  const authController = new AuthController(new LoginService(userRepository));
  const usersController = new UsersController(
    new CreateUserService(userRepository),
    new UpdateUserProfileService(userRepository),
  );

  app.use(
    cors({
      origin: env.frontendUrl,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (request, response) => healthController.check(request, response));
  app.post("/api/auth/login", (request, response) => authController.login(request, response));
  app.post("/api/users", (request, response) => usersController.create(request, response));
  app.put("/api/users/me", authenticate, (request, response) => usersController.updateMe(request, response));

  return app;
}
