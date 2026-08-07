import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from "sequelize";

export class ClientModel extends Model<InferAttributes<ClientModel>, InferCreationAttributes<ClientModel>> {
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare cpf: string;
  declare notes: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): void {
    ClientModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cpf: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: ""
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: ""
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: "Client",
        tableName: "clients",
        timestamps: true,
        indexes: [
          {
            fields: ["userId"]
          }
        ],
        hooks: {
          beforeValidate: (client) => {
            client.name = client.name.trim();
            client.email = client.email.trim().toLowerCase();
            client.phone = client.phone.trim();
            client.cpf = client.cpf?.trim() ?? "";
            client.notes = client.notes.trim();
          }
        }
      }
    );
  }
}
