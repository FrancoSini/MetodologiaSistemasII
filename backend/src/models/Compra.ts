import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type MedioPago = "debito" | "credito" | "efectivo";
export type EstadoCompra = "pendiente" | "confirmada" | "cancelada";

// acá guardamos el dato tal cual lo eligió el
// cliente (simple, un campo). La DECISIÓN de qué lógica de pago ejecutar
// según este valor es responsabilidad de un PaymentFactory en la capa de
// servicios, no de este modelo. El modelo solo persiste el dato.
interface CompraAttributes {
  id: number;
  usuarioId: number;
  fecha: Date;
  medioPago: MedioPago;
  total: number;
  estado: EstadoCompra;
}

interface CompraCreationAttributes
  extends Optional<CompraAttributes, "id" | "fecha" | "estado"> {}

class Compra
  extends Model<CompraAttributes, CompraCreationAttributes>
  implements CompraAttributes
{
  public id!: number;
  public usuarioId!: number;
  public fecha!: Date;
  public medioPago!: MedioPago;
  public total!: number;
  public estado!: EstadoCompra;
}

Compra.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "usuario_id",
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    medioPago: {
      type: DataTypes.ENUM("debito", "credito", "efectivo"),
      allowNull: false,
      field: "medio_pago",
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmada", "cancelada"),
      allowNull: false,
      defaultValue: "pendiente",
    },
  },
  {
    sequelize,
    tableName: "compras",
    modelName: "Compra",
    timestamps: true,
  }
);

export default Compra;