export type ServiceDto = {
  id: number;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
};

export type CreateServiceRequestDto = {
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
};

export type UpdateServiceRequestDto = {
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
};

export type ListServicesQueryDto = {
  page?: number;
  search?: string;
};
