import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import { ProfessionalWorkDayModel } from "./professional-work-day.model";

export class ProfessionalModel extends Model<
  InferAttributes<ProfessionalModel>,
  InferCreationAttributes<ProfessionalModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare organizationId: CreationOptional<number | null>;
  declare membershipId: CreationOptional<number | null>;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare specialty: string;
  declare status: string;
  declare deletedAt: CreationOptional<Date | null>;
  declare workDays?: NonAttribute<ProfessionalWorkDayModel[]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): void {
    ProfessionalModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        organizationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: { model: "organizations", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        membershipId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: { model: "memberships", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        specialty: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "ativo",
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Professional",
        tableName: "professionals",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            fields: ["userId"],
          },
        ],
        hooks: {
          beforeValidate: (professional) => {
            professional.name = professional.name.trim();
            professional.email = professional.email.trim().toLowerCase();
            professional.phone = professional.phone.trim();
            professional.specialty = professional.specialty.trim();
            professional.status = professional.status.trim().toLowerCase();
          },
        },
      },
    );
  }
}
