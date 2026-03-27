import { Sequelize } from "sequelize";

import { env } from "./env";
import { UserModel } from "../modules/auth/models/user.model";
import { hashPassword, isPasswordHashed } from "../modules/auth/utils/password.util";

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
      console.log(error instanceof Error ? error.message : "Unknown database connection error.");
      return false;
    }
  }

  public async synchronize(): Promise<void> {
    await this.getConnection().sync();
    await this.seedAuthUser();

    console.log("Database tables synchronized.");
  }
}

export const database = new Database();
