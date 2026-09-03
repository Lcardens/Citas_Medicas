const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clinica";
    const conexion = await mongoose.connect(mongoUri);

    console.log("MongoDB conectada:", conexion.connection.host);
    return conexion;
  } catch (error) {
    console.error("Error al conectar MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;
