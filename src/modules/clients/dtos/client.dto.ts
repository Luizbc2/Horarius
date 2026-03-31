export type ClientDto = {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export type CreateClientRequestDto = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export type UpdateClientRequestDto = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export type ListClientsQueryDto = {
  limit?: number;
  page?: number;
  search?: string;
};
