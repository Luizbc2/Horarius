export class AppointmentAccessError extends Error {
  constructor(message = "Você só pode alterar os agendamentos atribuídos ao seu perfil profissional.") {
    super(message);
    this.name = "AppointmentAccessError";
  }
}
