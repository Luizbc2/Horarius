import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from "sequelize";

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare cpf: string;
  declare password: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): void {
    UserModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        cpf: {
          type: DataTypes.STRING(11),
          allowNull: false,
          unique: true,
          validate: {
            len: [11, 11]
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true
          }
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
        modelName: "User",
        tableName: "users",
        timestamps: true,
        hooks: {
          beforeValidate: (user) => {
            user.name = user.name.trim();
            user.email = user.email.trim().toLowerCase();
            user.cpf = user.cpf.replace(/\D/g, "");
          }
        }
      }
    );
  }
}
