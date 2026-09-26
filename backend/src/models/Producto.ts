import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ProductoAttributes {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface ProductoCreationAttributes
  extends Optional<ProductoAttributes, "id"> {}

class Producto
  extends Model<ProductoAttributes, ProductoCreationAttributes>
  implements ProductoAttributes
{
  public id!: number;
  public nombre!: string;
  public precio!: number;
  public stock!: number;
  public categoria!: string;
}

Producto.init(
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
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "productos",
    modelName: "Producto",
    timestamps: true,
  }
);

export default Producto;