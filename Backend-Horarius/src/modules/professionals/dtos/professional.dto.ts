export type ProfessionalDto = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
};

export type ProfessionalWorkDayDto = {
  id: number;
  professionalId: number;
  dayOfWeek: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
};

export type CreateProfessionalRequestDto = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
};

export type UpdateProfessionalRequestDto = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: string;
};

export type ListProfessionalsQueryDto = {
  limit?: number;
  page?: number;
  search?: string;
};

export type UpdateProfessionalWorkDaysRequestDto = {
  workDays: ProfessionalWorkDayInputDto[];
};

export type ProfessionalWorkDayInputDto = {
  dayOfWeek: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
};
