import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface CompraProductoAttributes {
  id: number;
  compraId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number; // precio al momento de la compra (no el actual del producto)
}

interface CompraProductoCreationAttributes
  extends Optional<CompraProductoAttributes, "id"> {}

class CompraProducto
  extends Model<CompraProductoAttributes, CompraProductoCreationAttributes>
  implements CompraProductoAttributes
{
  public id!: number;
  public compraId!: number;
  public productoId!: number;
  public cantidad!: number;
  public precioUnitario!: number;
}

CompraProducto.init(
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
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "producto_id",
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "precio_unitario",
    },
  },
  {
    sequelize,
    tableName: "compra_productos",
    modelName: "CompraProducto",
    timestamps: true,
  }
);

export default CompraProducto;