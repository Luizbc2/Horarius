export type PersonalEventDto = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string;
  reminderMinutes: number;
  completed: boolean;
};

export type PersonalEventInput = Omit<PersonalEventDto, "id">;
