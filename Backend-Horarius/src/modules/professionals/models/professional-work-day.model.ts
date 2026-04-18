import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

const VALID_WEEK_DAYS = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
] as const;

export class ProfessionalWorkDayModel extends Model<
  InferAttributes<ProfessionalWorkDayModel>,
  InferCreationAttributes<ProfessionalWorkDayModel>
> {
  declare id: CreationOptional<number>;
  declare professionalId: number;
  declare dayOfWeek: string;
  declare enabled: boolean;
  declare startTime: string;
  declare endTime: string;
  declare breakStart: CreationOptional<string | null>;
  declare breakEnd: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): void {
    ProfessionalWorkDayModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        professionalId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "professionals",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        dayOfWeek: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [VALID_WEEK_DAYS],
          },
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        startTime: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "09:00",
        },
        endTime: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "18:00",
        },
        breakStart: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        breakEnd: {
          type: DataTypes.STRING,
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
        modelName: "ProfessionalWorkDay",
        tableName: "professional_work_days",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["professionalId", "dayOfWeek"],
          },
        ],
        hooks: {
          beforeValidate: (workDay) => {
            workDay.dayOfWeek = workDay.dayOfWeek.trim().toLowerCase();
            workDay.startTime = workDay.startTime.trim();
            workDay.endTime = workDay.endTime.trim();
            workDay.breakStart = workDay.breakStart?.trim() || null;
            workDay.breakEnd = workDay.breakEnd?.trim() || null;
          },
        },
      },
    );
  }
}
