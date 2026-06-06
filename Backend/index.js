require("dotenv").config();
const express = require("express");
const conectarDB = require("./config/db");
const pacienteRoutes = require("./routes/pacienteRoutes");
const medicoRoutes = require("./routes/medicoRoutes");
const citaRoutes = require("./routes/citaRoutes");

const app = express();

conectarDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/citas", citaRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "¡API funcionando!" });
});

module.exports = app;

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${process.env.PORT}`);
});
