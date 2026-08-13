import { Router } from "express";

import { authenticate } from "../../auth/middlewares/auth.middleware";
import { authorize } from "../../auth/middlewares/authorize.middleware";
import { AdminUsersController } from "../controllers/admin-users.controller";
import { SequelizeAdminUserRepository } from "../repositories/admin-user.repository";
import { AdminUsersService } from "../services/admin-users.service";

const adminRoutes = Router();
const controller = new AdminUsersController(new AdminUsersService(new SequelizeAdminUserRepository()));

adminRoutes.use(authenticate, authorize("admin"));
adminRoutes.get("/users", (request, response) => controller.list(request, response));
adminRoutes.patch("/users/:id/role", (request, response) => controller.changeRole(request, response));
adminRoutes.patch("/users/:id/status", (request, response) => controller.changeStatus(request, response));
adminRoutes.delete("/users/:id", (request, response) => controller.remove(request, response));

export { adminRoutes };
