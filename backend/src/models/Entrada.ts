import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface EntradaAttributes {
  id: number;
  compraId: number;
  funcionButacaId: number;
  codigo: string;
  fechaEmision: Date;
}

interface EntradaCreationAttributes
  extends Optional<EntradaAttributes, "id" | "fechaEmision"> {}

class Entrada
  extends Model<EntradaAttributes, EntradaCreationAttributes>
  implements EntradaAttributes
{
  public id!: number;
  public compraId!: number;
  public funcionButacaId!: number;
  public codigo!: string;
  public fechaEmision!: Date;
}

Entrada.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    compraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "compra_id",
    },
    funcionButacaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // una FuncionButaca solo puede tener una Entrada asociada
      field: "funcion_butaca_id",
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fechaEmision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "fecha_emision",
    },
  },
  {
    sequelize,
    tableName: "entradas",
    modelName: "Entrada",
    timestamps: true,
  }
);

export default Entrada;