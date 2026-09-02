export class AppointmentConflictError extends Error {
  constructor(message = "O profissional já possui um agendamento nesse intervalo.") {
    super(message);
    this.name = "AppointmentConflictError";
  }
}
