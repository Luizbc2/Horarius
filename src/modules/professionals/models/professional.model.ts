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
  declare name: string;
  declare email: string;
  declare phone: string;
  declare specialty: string;
  declare status: string;
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
