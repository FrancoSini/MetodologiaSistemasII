import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type RolUsuario = "admin" | "cliente";

interface UsuarioAttributes {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: RolUsuario;
}

// creamos usuer, y el id lo genera la base de datos automáticamente
interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, "id"> {}

class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  public id!: number;
  public nombre!: string;
  public email!: string;
  public passwordHash!: string;
  public rol!: RolUsuario;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    rol: {
      type: DataTypes.ENUM("admin", "cliente"),
      allowNull: false,
      defaultValue: "cliente",
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    modelName: "Usuario",
    timestamps: true,
  }
);

export default Usuario;