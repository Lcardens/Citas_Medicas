require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const conectarDB = require("./config/db");

// Importar Rutas
const pacienteRoutes = require("./routes/pacienteRoutes");
const medicoRoutes = require("./routes/medicoRoutes");
const citaRoutes = require("./routes/citaRoutes");
const authRoutes = require("./routes/authRoutes");
const reporteRoutes = require("./routes/reporteRoutes");

const app = express();
app.set("etag", false);
// Conexión a la base de datos
conectarDB();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/reportes", reporteRoutes);

// Servir el build de producción del frontend Angular
const angularBuildPath = path.join(__dirname, "../Frontend/dist/frontend/browser");
app.use(express.static(angularBuildPath));

// Fallback SPA para rutas que no sean /api/*
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(angularBuildPath, "index.html"));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
