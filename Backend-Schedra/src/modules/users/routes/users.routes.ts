import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { SequelizeUserRepository } from "../../auth/repositories/sequelize-user.repository";
import { UsersController } from "../controllers/users.controller";
import { CreateUserService } from "../services/create-user.service";
import { UpdateUserProfileService } from "../services/update-user-profile.service";

const usersRoutes = Router();
const userRepository = new SequelizeUserRepository();
const createUserService = new CreateUserService(userRepository);
const updateUserProfileService = new UpdateUserProfileService(userRepository);
const usersController = new UsersController(createUserService, updateUserProfileService);
const avatarDirectory = path.resolve(process.cwd(), "uploads", "avatars");
fs.mkdirSync(avatarDirectory, { recursive: true });
const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: avatarDirectory,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
      callback(null, `user-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
  },
});

usersRoutes.post("/", (request, response) => usersController.create(request, response));
usersRoutes.put("/me", authenticate, (request, response) => usersController.updateMe(request, response));
usersRoutes.patch("/me/avatar", authenticate, uploadAvatar.single("avatar"), (request, response) =>
  usersController.updateAvatar(request, response),
);

export { usersRoutes };
