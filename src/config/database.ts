import { Sequelize } from "sequelize";

import { env } from "./env";
import { UserModel } from "../modules/auth/models/user.model";
import { hashPassword, isPasswordHashed } from "../modules/auth/utils/password.util";

class Database {
  private sequelize: Sequelize | null = null;

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
    UserModel.initialize(this.getConnection());
  }

  private async seedAuthUser(): Promise<void> {
    const hashedPassword = await hashPassword(env.authDemoUser.password);
    const [user] = await UserModel.findOrCreate({
      where: {
        email: env.authDemoUser.email.toLowerCase()
      },
      defaults: {
        name: env.authDemoUser.name,
        email: env.authDemoUser.email.toLowerCase(),
        cpf: env.authDemoUser.cpf,
        password: hashedPassword
      }
    });

    if (!isPasswordHashed(user.password)) {
      await user.update({
        password: hashedPassword
      });
    }
  }

  public async connect(): Promise<boolean> {
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
    this.initializeModels();

    await this.getConnection().sync();
    await this.seedAuthUser();

    console.log("Database tables synchronized.");
  }
}

export const database = new Database();
