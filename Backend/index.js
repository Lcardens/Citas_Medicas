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

conectarDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/citas", citaRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "¡API funcionando!" });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${process.env.PORT}`);
});

module.exports = app;
