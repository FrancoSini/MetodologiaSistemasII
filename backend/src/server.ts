import "dotenv/config";
import app from "./app";
import sequelize from "./config/database";
import "./models"; // registra los modelos y sus asociaciones

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida correctamente.");

    // Crea las tablas que falten (NO borra ni modifica las existentes).
    await sequelize.sync();
    console.log("Tablas sincronizadas.");
  } catch (error) {
    console.error("No se pudo inicializar la base de datos:", error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
}

main();