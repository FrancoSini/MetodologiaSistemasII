
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type EstadoFuncion = "programada" | "cancelada";

interface FuncionAttributes {
  id: number;
  peliculaId: number;
  salaId: number;
  fecha: string;
  hora: string;
  estado: EstadoFuncion;
}

interface FuncionCreationAttributes
  extends Optional<FuncionAttributes, "id" | "estado"> {}

class Funcion
  extends Model<FuncionAttributes, FuncionCreationAttributes>
  implements FuncionAttributes
{
  public id!: number;
  public peliculaId!: number;
  public salaId!: number;
  public fecha!: string;
  public hora!: string;
  public estado!: EstadoFuncion;
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
    estado: {
      type: DataTypes.ENUM("programada", "cancelada"),
      allowNull: false,
      defaultValue: "programada",
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
