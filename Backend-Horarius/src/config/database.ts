import { Sequelize } from "sequelize";

import { env } from "./env";
import { AppointmentModel } from "../modules/appointments/models/appointment.model";
import { UserModel } from "../modules/auth/models/user.model";
import { ClientModel } from "../modules/clients/models/client.model";
import { hashPassword, isPasswordHashed } from "../modules/auth/utils/password.util";
import { ServiceModel } from "../modules/services/models/service.model";
import { ProfessionalModel } from "../modules/professionals/models/professional.model";
import { ProfessionalWorkDayModel } from "../modules/professionals/models/professional-work-day.model";

class Database {
  private sequelize: Sequelize | null = null;
  private modelsInitialized = false;

  public isConfigured(): boolean {
    const { host, name, user, password } = env.database;

    return Boolean(host && name && user && password);
  }

  public getConnection(): Sequelize {
    if (!this.sequelize) {
      this.sequelize = new Sequelize(env.database.name, env.database.user, env.database.password, {
        host: env.database.host,
        port: env.database.port,
        dialect: "postgres",
        logging: false
      });
    }

    return this.sequelize;
  }

  private initializeModels(): void {
    if (this.modelsInitialized) {
      return;
    }

    UserModel.initialize(this.getConnection());
    ClientModel.initialize(this.getConnection());
    ServiceModel.initialize(this.getConnection());
    ProfessionalModel.initialize(this.getConnection());
    ProfessionalWorkDayModel.initialize(this.getConnection());
    AppointmentModel.initialize(this.getConnection());

    UserModel.hasMany(ClientModel, {
      foreignKey: "userId",
      as: "clients",
    });
    UserModel.hasMany(ServiceModel, {
      foreignKey: "userId",
      as: "services",
    });
    UserModel.hasMany(ProfessionalModel, {
      foreignKey: "userId",
      as: "professionals",
    });
    UserModel.hasMany(AppointmentModel, {
      foreignKey: "userId",
      as: "appointments",
    });
    ClientModel.hasMany(AppointmentModel, {
      foreignKey: "clientId",
      as: "appointments",
    });
    ProfessionalModel.hasMany(AppointmentModel, {
      foreignKey: "professionalId",
      as: "appointments",
    });
    ProfessionalModel.hasMany(ProfessionalWorkDayModel, {
      foreignKey: "professionalId",
      as: "workDays",
    });
    ServiceModel.hasMany(AppointmentModel, {
      foreignKey: "serviceId",
      as: "appointments",
    });

    ClientModel.belongsTo(UserModel, {
      foreignKey: "userId",
      as: "user",
    });
    ServiceModel.belongsTo(UserModel, {
      foreignKey: "userId",
      as: "user",
    });
    ProfessionalModel.belongsTo(UserModel, {
      foreignKey: "userId",
      as: "user",
    });
    AppointmentModel.belongsTo(UserModel, {
      foreignKey: "userId",
      as: "user",
    });
    AppointmentModel.belongsTo(ClientModel, {
      foreignKey: "clientId",
      as: "client",
    });
    AppointmentModel.belongsTo(ProfessionalModel, {
      foreignKey: "professionalId",
      as: "professional",
    });
    ProfessionalWorkDayModel.belongsTo(ProfessionalModel, {
      foreignKey: "professionalId",
      as: "professional",
    });
    AppointmentModel.belongsTo(ServiceModel, {
      foreignKey: "serviceId",
      as: "service",
    });

    this.modelsInitialized = true;
  }

  private async seedAuthUser(): Promise<void> {
    const email = env.authSeedUser.email.toLowerCase();
    const hashedPassword = await hashPassword(env.authSeedUser.password);
    const existingUser = await UserModel.findOne({
      where: {
        email
      }
    });

    if (!existingUser) {
      await UserModel.create({
        name: env.authSeedUser.name.trim(),
        email,
        cpf: env.authSeedUser.cpf,
        password: hashedPassword
      });

      return;
    }

    if (!isPasswordHashed(existingUser.password)) {
      await existingUser.update({
        password: hashedPassword
      });
    }
  }

  public async connect(): Promise<boolean> {
    this.initializeModels();

    if (!this.isConfigured()) {
      console.log("Database connection skipped: configure PostgreSQL variables when ready.");
      return false;
    }

    try {
      await this.getConnection().authenticate();
      console.log("Database connection established.");
      return true;
    } catch (error) {
      console.log("Database connection failed. Backend will keep running without database access for now.");
      console.log(error instanceof Error ? error.message : "Database connection error not identified.");
      return false;
    }
  }

  public async synchronize(): Promise<void> {
    await this.getConnection().sync({
      alter: true
    });
    await this.seedAuthUser();

    console.log("Database tables synchronized.");
  }
}

export const database = new Database();
