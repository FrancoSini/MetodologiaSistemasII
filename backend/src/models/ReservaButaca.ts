
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type EstadoReserva =
  | "activa"
  | "liberada"
  | "vencida"
  | "consumida";

interface ReservaButacaAttributes {
  id: number;
  compraId: number;
  funcionButacaId: number;
  venceEn: Date;
  estado: EstadoReserva;
}

interface ReservaButacaCreationAttributes
  extends Optional<ReservaButacaAttributes, "id" | "estado"> {}

class ReservaButaca
  extends Model<
    ReservaButacaAttributes,
    ReservaButacaCreationAttributes
  >
  implements ReservaButacaAttributes
{
  public id!: number;
  public compraId!: number;
  public funcionButacaId!: number;
  public venceEn!: Date;
  public estado!: EstadoReserva;
}

ReservaButaca.init(
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
      field: "funcion_butaca_id",
    },

    venceEn: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "vence_en",
    },

    estado: {
      type: DataTypes.ENUM(
        "activa",
        "liberada",
        "vencida",
        "consumida"
      ),
      allowNull: false,
      defaultValue: "activa",
    },
  },
  {
    sequelize,
    tableName: "reservas_butacas",
    modelName: "ReservaButaca",
    timestamps: true,

    // Una butaca puede tener varias reservas históricas,
    // pero solamente una reserva activa a la vez.
    indexes: [
      {
        name: "reservas_butacas_unica_activa",
        unique: true,
        fields: ["funcion_butaca_id"],
        where: {
          estado: "activa",
        },
      },
    ],
  }
);

export default ReservaButaca;
