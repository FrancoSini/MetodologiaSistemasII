import sequelize from "../config/database";
import Usuario from "./Usuario";
import Pelicula from "./Pelicula";
import Sala from "./Sala";
import Butaca from "./Butaca";
import Funcion from "./Funcion";
import FuncionButaca from "./Funcionbutaca";
import Producto from "./Producto";
import Compra from "./Compra";
import CompraProducto from "./Compraproducto";
import Entrada from "./Entrada";

// ---- Usuario <-> Compra ----
Usuario.hasMany(Compra, { foreignKey: "usuarioId" });
Compra.belongsTo(Usuario, { foreignKey: "usuarioId" });

// ---- Pelicula / Sala <-> Funcion ----
Pelicula.hasMany(Funcion, { foreignKey: "peliculaId" });
Funcion.belongsTo(Pelicula, { foreignKey: "peliculaId" });

Sala.hasMany(Funcion, { foreignKey: "salaId" });
Funcion.belongsTo(Sala, { foreignKey: "salaId" });

// ---- Sala <-> Butaca distribución de butacas  ----
Sala.hasMany(Butaca, { foreignKey: "salaId" });
Butaca.belongsTo(Sala, { foreignKey: "salaId" });

// ---- Funcion <-> Butaca, desde FuncionButaca (estado por función) ----
Funcion.hasMany(FuncionButaca, { foreignKey: "funcionId" });
FuncionButaca.belongsTo(Funcion, { foreignKey: "funcionId" });

Butaca.hasMany(FuncionButaca, { foreignKey: "butacaId" });
FuncionButaca.belongsTo(Butaca, { foreignKey: "butacaId" });

// ---- Compra <-> Producto, desde CompraProducto ----
Compra.hasMany(CompraProducto, { foreignKey: "compraId" });
CompraProducto.belongsTo(Compra, { foreignKey: "compraId" });

Producto.hasMany(CompraProducto, { foreignKey: "productoId" });
CompraProducto.belongsTo(Producto, { foreignKey: "productoId" });

// ---- Compra <-> Entrada ----
Compra.hasMany(Entrada, { foreignKey: "compraId" });
Entrada.belongsTo(Compra, { foreignKey: "compraId" });

// ---- FuncionButaca <-> Entrada cada butaca-función vendida genera 1 entrada ----
FuncionButaca.hasOne(Entrada, { foreignKey: "funcionButacaId" });
Entrada.belongsTo(FuncionButaca, { foreignKey: "funcionButacaId" });

export {
  sequelize,
  Usuario,
  Pelicula,
  Sala,
  Butaca,
  Funcion,
  FuncionButaca,
  Producto,
  Compra,
  CompraProducto,
  Entrada,
};