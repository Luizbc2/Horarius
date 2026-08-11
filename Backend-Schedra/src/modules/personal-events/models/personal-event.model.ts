import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class PersonalEventModel extends Model<InferAttributes<PersonalEventModel>, InferCreationAttributes<PersonalEventModel>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare title: string;
  declare startsAt: Date;
  declare endsAt: Date;
  declare location: CreationOptional<string>;
  declare notes: CreationOptional<string>;
  declare reminderMinutes: CreationOptional<number>;
  declare completed: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initialize(sequelize: Sequelize) {
    PersonalEventModel.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(120), allowNull: false },
      startsAt: { type: DataTypes.DATE, allowNull: false },
      endsAt: { type: DataTypes.DATE, allowNull: false },
      location: { type: DataTypes.STRING(160), allowNull: false, defaultValue: "" },
      notes: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
      reminderMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
      completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    }, { sequelize, modelName: "PersonalEvent", tableName: "personal_events", timestamps: true });
  }
}
