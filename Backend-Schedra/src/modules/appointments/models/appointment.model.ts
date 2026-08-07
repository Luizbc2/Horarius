import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class AppointmentModel extends Model<
  InferAttributes<AppointmentModel>,
  InferCreationAttributes<AppointmentModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare clientId: number;
  declare professionalId: number;
  declare serviceId: number;
  declare scheduledAt: Date;
  declare status: string;
  declare notes: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): void {
    AppointmentModel.init(
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
        clientId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "clients",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        professionalId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "professionals",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        serviceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "services",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        scheduledAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "pendente",
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: "",
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
        modelName: "Appointment",
        tableName: "appointments",
        timestamps: true,
        indexes: [
          {
            fields: ["userId"],
          },
        ],
        hooks: {
          beforeValidate: (appointment) => {
            appointment.status = appointment.status.trim().toLowerCase();
            appointment.notes = appointment.notes.trim();
          },
        },
      },
    );
  }
}
