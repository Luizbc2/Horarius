import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { SequelizeUserRepository } from "../../auth/repositories/sequelize-user.repository";
import { UsersController } from "../controllers/users.controller";
import { CreateUserService } from "../services/create-user.service";
import { UpdateUserProfileService } from "../services/update-user-profile.service";
import { uploadAvatarSingle } from "../upload/avatar-upload";

const usersRoutes = Router();
const userRepository = new SequelizeUserRepository();
const createUserService = new CreateUserService(userRepository);
const updateUserProfileService = new UpdateUserProfileService(userRepository);
const usersController = new UsersController(createUserService, updateUserProfileService);

usersRoutes.post("/", (request, response) => usersController.create(request, response));
usersRoutes.put("/me", authenticate, (request, response) => usersController.updateMe(request, response));
usersRoutes.patch("/me/avatar", authenticate, uploadAvatarSingle, (request, response) =>
  usersController.updateAvatar(request, response),
);

export { usersRoutes };
