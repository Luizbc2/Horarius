import { Router } from "express";

import { asyncHandler } from "../../../shared/http/request-context";
import { authenticate } from "../../auth/middlewares/auth.middleware";
import { OrganizationsController } from "../controllers/organizations.controller";

const organizationsRoutes = Router();
const controller = new OrganizationsController();

organizationsRoutes.use(authenticate);
organizationsRoutes.get("/", asyncHandler((request, response) => controller.list(request, response)));
organizationsRoutes.post("/", asyncHandler((request, response) => controller.create(request, response)));
organizationsRoutes.post("/:id/activate", asyncHandler((request, response) => controller.activate(request, response)));
organizationsRoutes.get("/:id/members", asyncHandler((request, response) => controller.listMembers(request, response)));
organizationsRoutes.post("/:id/members", asyncHandler((request, response) => controller.addMember(request, response)));
organizationsRoutes.delete("/:id/members/:userId", asyncHandler((request, response) => controller.removeMember(request, response)));

export { organizationsRoutes };
