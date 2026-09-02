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
  declare organizationId: CreationOptional<number | null>;
  declare clientId: number;
  declare professionalId: number;
  declare serviceId: number;
  declare scheduledAt: Date;
  declare endsAt: CreationOptional<Date | null>;
  declare durationMinutes: CreationOptional<number | null>;
  declare clientNameSnapshot: CreationOptional<string | null>;
  declare professionalNameSnapshot: CreationOptional<string | null>;
  declare serviceNameSnapshot: CreationOptional<string | null>;
  declare priceSnapshot: CreationOptional<number | null>;
  declare version: CreationOptional<number>;
  declare status: string;
  declare notes: string;
  declare deletedAt: CreationOptional<Date | null>;
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
        organizationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          references: { model: "organizations", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        endsAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        durationMinutes: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
          validate: { min: 1, max: 1440 },
        },
        clientNameSnapshot: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        professionalNameSnapshot: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        serviceNameSnapshot: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        priceSnapshot: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: null,
        },
        version: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
        modelName: "Appointment",
        tableName: "appointments",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            fields: ["userId"],
          },
        ],
        version: true,
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
