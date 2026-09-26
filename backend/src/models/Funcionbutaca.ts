import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";


// "evitar que una misma butaca sea vendida para la misma función a más de un cliente".
// El estado es POR FUNCIÓN, no global a la butaca.
export type EstadoFuncionButaca = "disponible" | "reservada" | "vendida";

interface FuncionButacaAttributes {
  id: number;
  funcionId: number;
  butacaId: number;
  estado: EstadoFuncionButaca;
}

interface FuncionButacaCreationAttributes
  extends Optional<FuncionButacaAttributes, "id" | "estado"> {}

class FuncionButaca
  extends Model<FuncionButacaAttributes, FuncionButacaCreationAttributes>
  implements FuncionButacaAttributes
{
  public id!: number;
  public funcionId!: number;
  public butacaId!: number;
  public estado!: EstadoFuncionButaca;
}

FuncionButaca.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    funcionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "funcion_id",
    },
    butacaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "butaca_id",
    },
    estado: {
      type: DataTypes.ENUM("disponible", "reservada", "vendida"),
      allowNull: false,
      defaultValue: "disponible",
    },
  },
  {
    sequelize,
    tableName: "funcion_butacas",
    modelName: "FuncionButaca",
    timestamps: true,
    indexes: [
      {
        // Una butaca no puede tener dos filas para la misma función:
        // esta restricción a nivel de base de datos es la que garantiza
        // que no se pueda vender dos veces el mismo lugar.
        unique: true,
        fields: ["funcion_id", "butaca_id"],
      },
    ],
  }
);

export default FuncionButaca;