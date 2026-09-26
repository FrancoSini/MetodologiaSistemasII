import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface FuncionAttributes {
  id: number;
  peliculaId: number;
  salaId: number;
  fecha: string; // formato YYYY-MM-DD
  hora: string; // formato HH:mm
}

interface FuncionCreationAttributes extends Optional<FuncionAttributes, "id"> {}

class Funcion
  extends Model<FuncionAttributes, FuncionCreationAttributes>
  implements FuncionAttributes
{
  public id!: number;
  public peliculaId!: number;
  public salaId!: number;
  public fecha!: string;
  public hora!: string;
}

Funcion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    peliculaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "pelicula_id",
    },
    salaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sala_id",
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "funciones",
    modelName: "Funcion",
    timestamps: true,
  }
);

export default Funcion;