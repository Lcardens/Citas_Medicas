require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conectarDB = require("./config/db");

// Importar Rutas
const pacienteRoutes = require("./routes/pacienteRoutes");
const medicoRoutes = require("./routes/medicoRoutes");
const citaRoutes = require("./routes/citaRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.set("etag", false);
// Conexión a la base de datos
conectarDB();

// 1. Configurar CORS (debe ir ANTES de las rutas)
app.use(cors());

// 2. Parsers de peticiones (deben ir ANTES de las rutas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/citas", citaRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "¡API funcionando!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
