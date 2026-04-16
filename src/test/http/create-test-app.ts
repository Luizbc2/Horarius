import cors from "cors";
import express, { Response } from "express";

import { env } from "../../config/env";
import { HealthController } from "../../controllers/health.controller";
import { CreateAppointmentService } from "../../modules/appointments/services/create-appointment.service";
import { DeleteAppointmentService } from "../../modules/appointments/services/delete-appointment.service";
import { ListAppointmentsService } from "../../modules/appointments/services/list-appointments.service";
import { UpdateAppointmentService } from "../../modules/appointments/services/update-appointment.service";
import { AuthController } from "../../modules/auth/controllers/auth.controller";
import { authenticate } from "../../modules/auth/middlewares/auth.middleware";
import { UserRepository } from "../../modules/auth/repositories/user.repository";
import { LoginService } from "../../modules/auth/services/login.service";
import { GetClientService } from "../../modules/clients/services/get-client.service";
import { CreateClientService } from "../../modules/clients/services/create-client.service";
import { DeleteClientService } from "../../modules/clients/services/delete-client.service";
import { ListClientsService } from "../../modules/clients/services/list-clients.service";
import { UpdateClientService } from "../../modules/clients/services/update-client.service";
import { GetProfessionalService } from "../../modules/professionals/services/get-professional.service";
import { CreateProfessionalService } from "../../modules/professionals/services/create-professional.service";
import { DeleteProfessionalService } from "../../modules/professionals/services/delete-professional.service";
import { ListProfessionalWorkDaysService } from "../../modules/professionals/services/list-professional-work-days.service";
import { ListProfessionalsService } from "../../modules/professionals/services/list-professionals.service";
import { UpdateProfessionalService } from "../../modules/professionals/services/update-professional.service";
import { UpdateProfessionalWorkDaysService } from "../../modules/professionals/services/update-professional-work-days.service";
import { GetServiceService } from "../../modules/services/services/get-service.service";
import { CreateServiceService } from "../../modules/services/services/create-service.service";
import { DeleteServiceService } from "../../modules/services/services/delete-service.service";
import { ListServicesService } from "../../modules/services/services/list-services.service";
import { UpdateServiceService } from "../../modules/services/services/update-service.service";
import { UsersController } from "../../modules/users/controllers/users.controller";
import { CreateUserService } from "../../modules/users/services/create-user.service";
import { UpdateUserProfileService } from "../../modules/users/services/update-user-profile.service";
import {
  asBoolean,
  asNullableString,
  asNumber,
  asRequestBody,
  asRequiredNumber,
  asString,
  type RequestBody,
  type RequestValue,
} from "../../shared/http/request-parser";
import { AppointmentRepository } from "../../modules/appointments/repositories/appointment.repository";
import { ClientRepository } from "../../modules/clients/repositories/client.repository";
import { ProfessionalRepository } from "../../modules/professionals/repositories/professional.repository";
import { ServiceRepository } from "../../modules/services/repositories/service.repository";
import { InMemoryAppointmentRepository } from "../mocks/in-memory-appointment.repository";
import { InMemoryClientRepository } from "../mocks/in-memory-client.repository";
import { InMemoryProfessionalRepository } from "../mocks/in-memory-professional.repository";
import { InMemoryServiceRepository } from "../mocks/in-memory-service.repository";

type TestRepositories = {
  userRepository: UserRepository;
  clientRepository?: ClientRepository;
  serviceRepository?: ServiceRepository;
  professionalRepository?: ProfessionalRepository;
  appointmentRepository?: AppointmentRepository;
};

type TestAppInput = UserRepository | TestRepositories;

type ServiceFailure = {
  success: false;
  message: string;
  statusCode: number;
};

type ServiceSuccess = {
  success: true;
  data: RequestValue;
};

export function createTestApp(input: TestAppInput) {
  const app = express();
  const repositories = resolveRepositories(input);
  const healthController = new HealthController();
  const authController = new AuthController(new LoginService(repositories.userRepository));
  const usersController = new UsersController(
    new CreateUserService(repositories.userRepository),
    new UpdateUserProfileService(repositories.userRepository),
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

  app.get("/api/clients/:id", authenticate, async (request, response) => {
    const result = await new GetClientService(repositories.clientRepository).execute(Number(request.params.id));
    return sendServiceResult(response, result, 200);
  });
  app.get("/api/clients", authenticate, async (request, response) => {
    const result = await new ListClientsService(repositories.clientRepository).execute({
      page: asNumber(request.query.page),
      limit: asNumber(request.query.limit),
      search: asString(request.query.search),
    });

    return response.status(200).json(result.data);
  });
  app.post("/api/clients", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new CreateClientService(repositories.clientRepository).execute({
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      cpf: asString(body.cpf),
      notes: asString(body.notes),
    });

    return sendServiceResult(response, result, 201);
  });
  app.put("/api/clients/:id", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new UpdateClientService(repositories.clientRepository).execute(Number(request.params.id), {
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      cpf: asString(body.cpf),
      notes: asString(body.notes),
    });

    return sendServiceResult(response, result, 200);
  });
  app.delete("/api/clients/:id", authenticate, async (request, response) => {
    const result = await new DeleteClientService(repositories.clientRepository).execute(Number(request.params.id));
    return sendServiceResult(response, result, 200);
  });

  app.get("/api/services/:id", authenticate, async (request, response) => {
    const result = await new GetServiceService(repositories.serviceRepository).execute(Number(request.params.id));
    return sendServiceResult(response, result, 200);
  });
  app.get("/api/services", authenticate, async (request, response) => {
    const result = await new ListServicesService(repositories.serviceRepository).execute({
      page: asNumber(request.query.page),
      limit: asNumber(request.query.limit),
      search: asString(request.query.search),
    });

    return response.status(200).json(result.data);
  });
  app.post("/api/services", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new CreateServiceService(repositories.serviceRepository).execute({
      name: asString(body.name),
      category: asString(body.category),
      durationMinutes: asRequiredNumber(body.durationMinutes),
      price: asRequiredNumber(body.price),
      description: asString(body.description),
    });

    return sendServiceResult(response, result, 201);
  });
  app.put("/api/services/:id", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new UpdateServiceService(repositories.serviceRepository).execute(Number(request.params.id), {
      name: asString(body.name),
      category: asString(body.category),
      durationMinutes: asRequiredNumber(body.durationMinutes),
      price: asRequiredNumber(body.price),
      description: asString(body.description),
    });

    return sendServiceResult(response, result, 200);
  });
  app.delete("/api/services/:id", authenticate, async (request, response) => {
    const result = await new DeleteServiceService(repositories.serviceRepository).execute(Number(request.params.id));
    return sendServiceResult(response, result, 200);
  });

  app.get("/api/professionals/:id", authenticate, async (request, response) => {
    const result = await new GetProfessionalService(repositories.professionalRepository).execute(
      Number(request.params.id),
    );
    return sendServiceResult(response, result, 200);
  });
  app.get("/api/professionals", authenticate, async (request, response) => {
    const result = await new ListProfessionalsService(repositories.professionalRepository).execute({
      page: asNumber(request.query.page),
      limit: asNumber(request.query.limit),
      search: asString(request.query.search),
    });

    return response.status(200).json(result.data);
  });
  app.post("/api/professionals", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new CreateProfessionalService(repositories.professionalRepository).execute({
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      specialty: asString(body.specialty),
      status: asString(body.status),
    });

    return sendServiceResult(response, result, 201);
  });
  app.put("/api/professionals/:id", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new UpdateProfessionalService(repositories.professionalRepository).execute(
      Number(request.params.id),
      {
        name: asString(body.name),
        email: asString(body.email),
        phone: asString(body.phone),
        specialty: asString(body.specialty),
        status: asString(body.status),
      },
    );

    return sendServiceResult(response, result, 200);
  });
  app.get("/api/professionals/:id/work-days", authenticate, async (request, response) => {
    const result = await new ListProfessionalWorkDaysService(repositories.professionalRepository).execute(
      Number(request.params.id),
    );
    return sendServiceResult(response, result, 200);
  });
  app.put("/api/professionals/:id/work-days", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new UpdateProfessionalWorkDaysService(repositories.professionalRepository).execute(
      Number(request.params.id),
      {
        workDays: parseWorkDays(body.workDays),
      },
    );

    return sendServiceResult(response, result, 200);
  });
  app.delete("/api/professionals/:id", authenticate, async (request, response) => {
    const result = await new DeleteProfessionalService(repositories.professionalRepository).execute(
      Number(request.params.id),
    );
    return sendServiceResult(response, result, 200);
  });

  app.get("/api/appointments", authenticate, async (request, response) => {
    const result = await new ListAppointmentsService(repositories.appointmentRepository).execute({
      date: asString(request.query.date),
      limit: asNumber(request.query.limit),
      page: asNumber(request.query.page),
      professionalId: asNumber(request.query.professionalId),
      status: parseAppointmentStatus(request.query.status),
    });

    return response.status(200).json(result.data);
  });
  app.post("/api/appointments", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new CreateAppointmentService(repositories.appointmentRepository).execute({
      clientId: asNumber(body.clientId) ?? 0,
      professionalId: asNumber(body.professionalId) ?? 0,
      serviceId: asNumber(body.serviceId) ?? 0,
      scheduledAt: asString(body.scheduledAt),
      status: parseRequiredAppointmentStatus(body.status),
      notes: asString(body.notes),
    });

    return sendServiceResult(response, result, 201);
  });
  app.put("/api/appointments/:id", authenticate, async (request, response) => {
    const body = asRequestBody(request.body);
    const result = await new UpdateAppointmentService(repositories.appointmentRepository).execute(
      Number(request.params.id),
      {
        clientId: asNumber(body.clientId) ?? 0,
        professionalId: asNumber(body.professionalId) ?? 0,
        serviceId: asNumber(body.serviceId) ?? 0,
        scheduledAt: asString(body.scheduledAt),
        status: parseRequiredAppointmentStatus(body.status),
        notes: asString(body.notes),
      },
    );

    return sendServiceResult(response, result, 200);
  });
  app.delete("/api/appointments/:id", authenticate, async (request, response) => {
    const result = await new DeleteAppointmentService(repositories.appointmentRepository).execute(
      Number(request.params.id),
    );
    return sendServiceResult(response, result, 200);
  });

  return app;
}

function resolveRepositories(input: TestAppInput): Required<TestRepositories> {
  if ("userRepository" in input) {
    return {
      userRepository: input.userRepository,
      clientRepository: input.clientRepository ?? new InMemoryClientRepository(),
      serviceRepository: input.serviceRepository ?? new InMemoryServiceRepository(),
      professionalRepository: input.professionalRepository ?? new InMemoryProfessionalRepository(),
      appointmentRepository: input.appointmentRepository ?? new InMemoryAppointmentRepository(),
    };
  }

  return {
    userRepository: input,
    clientRepository: new InMemoryClientRepository(),
    serviceRepository: new InMemoryServiceRepository(),
    professionalRepository: new InMemoryProfessionalRepository(),
    appointmentRepository: new InMemoryAppointmentRepository(),
  };
}

function sendServiceResult<T extends ServiceSuccess | ServiceFailure>(
  response: Response,
  result: T,
  successStatusCode: number,
): Response {
  if (!result.success) {
    return response.status(result.statusCode).json({
      message: result.message,
    });
  }

  return response.status(successStatusCode).json(result.data);
}

function parseWorkDays(value: RequestValue) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => parseWorkDay(item));
}

function parseWorkDay(value: RequestValue) {
  const item = parseWorkDayItem(value);

  return {
    dayOfWeek: asString(item.dayOfWeek),
    enabled: asBoolean(item.enabled),
    startTime: asString(item.startTime),
    endTime: asString(item.endTime),
    breakStart: asNullableString(item.breakStart),
    breakEnd: asNullableString(item.breakEnd),
  };
}

function parseWorkDayItem(value: RequestValue): RequestBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as RequestBody;
}

function parseAppointmentStatus(value: RequestValue) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedStatus = value.trim().toLowerCase();

  if (
    normalizedStatus === "confirmado" ||
    normalizedStatus === "pendente" ||
    normalizedStatus === "cancelado"
  ) {
    return normalizedStatus;
  }

  return undefined;
}

function parseRequiredAppointmentStatus(value: RequestValue) {
  return asString(value).trim().toLowerCase() as "confirmado" | "pendente" | "cancelado";
}
