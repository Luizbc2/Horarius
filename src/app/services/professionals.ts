import { createEntityService, type ListQueryParams, type PaginatedResponse } from "./entity-service";

export type ProfessionalApiItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
};

export type CreateProfessionalRequest = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
};

export type UpdateProfessionalRequest = CreateProfessionalRequest;

export type CreateProfessionalResponse = {
  message: string;
  professional: ProfessionalApiItem;
};

export type UpdateProfessionalResponse = {
  message: string;
  professional: ProfessionalApiItem;
};

export type DeleteProfessionalResponse = {
  message: string;
};

export const createProfessionalsService = (token: string) => {
  const entityService = createEntityService({
    resourcePath: "/professionals",
    token,
  });

  return {
    list: (query?: ListQueryParams) => entityService.list<ProfessionalApiItem>(query),
    create: (body: CreateProfessionalRequest) =>
      entityService.create<CreateProfessionalResponse, CreateProfessionalRequest>(body),
    update: (id: number, body: UpdateProfessionalRequest) =>
      entityService.update<UpdateProfessionalResponse, UpdateProfessionalRequest>(id, body),
    remove: (id: number) => entityService.remove<DeleteProfessionalResponse>(id),
  };
};

export type ProfessionalsListResponse = PaginatedResponse<ProfessionalApiItem>;
