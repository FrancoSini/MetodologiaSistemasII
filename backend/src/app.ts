import express from "express";
import sequelize from "./config/database";

const app = express();
const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida correctamente.");

    const [result]: any = await sequelize.query("SELECT 'Hola mundo desde Sequelize' AS mensaje");
    console.log(result[0].mensaje);
  } catch (error) {
    console.error(" No se pudo conectar a la base de datos:", error);
  }
}

main();

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});