import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Butaca representa la distribución FÍSICA y FIJA de una sala.
// El estado (disponible/vendida) : vive en FuncionButaca,
// porque una misma butaca puede estar libre en una función y ocupada en otra.
interface ButacaAttributes {
  id: number;
  salaId: number;
  fila: string;
  numero: number;
}

interface ButacaCreationAttributes extends Optional<ButacaAttributes, "id"> {}

class Butaca
  extends Model<ButacaAttributes, ButacaCreationAttributes>
  implements ButacaAttributes
{
  public id!: number;
  public salaId!: number;
  public fila!: string;
  public numero!: number;
}

Butaca.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    salaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sala_id",
    },
    fila: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "butacas",
    modelName: "Butaca",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["sala_id", "fila", "numero"],
      },
    ],
  }
);

export default Butaca;