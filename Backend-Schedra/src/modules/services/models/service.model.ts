import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ServiceModel extends Model<InferAttributes<ServiceModel>, InferCreationAttributes<ServiceModel>> {
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare name: string;
  declare category: string;
  declare durationMinutes: number;
  declare price: number;
  declare description: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): void {
    ServiceModel.init(
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        durationMinutes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        description: {
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
        modelName: "Service",
        tableName: "services",
        timestamps: true,
        indexes: [
          {
            fields: ["userId"],
          },
        ],
        hooks: {
          beforeValidate: (service) => {
            service.name = service.name.trim();
            service.category = service.category.trim();
            service.description = service.description.trim();
          },
        },
      },
    );
  }
}
