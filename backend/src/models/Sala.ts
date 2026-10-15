import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface SalaAttributes {
  id: number;
  nombre: string;
  cantidadButacas: number;
}

interface SalaCreationAttributes extends Optional<SalaAttributes, "id"> {}

class Sala
  extends Model<SalaAttributes, SalaCreationAttributes>
  implements SalaAttributes
{
  public id!: number;
  public nombre!: string;
  public cantidadButacas!: number;
}

Sala.init(
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
    cantidadButacas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cantidad_butacas",
    },
  },
  {
    sequelize,
    tableName: "salas",
    modelName: "Sala",
    timestamps: true,
  }
);

export default Sala;