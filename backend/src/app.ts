import express from "express";
import sequelize from "./config/database";
import "./models"; // registra los modelos y sus asociaciones 

const app = express();
const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida correctamente.");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos:", error);
  }
}

main();

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});