const express = require("express");
const router = express.Router();
const {
  crearPaciente,
  listarPacientes,
} = require("../controllers/pacienteController");

// Ruta para crear un nuevo paciente
router.post("/", crearPaciente);

// Ruta para listar todos los pacientes
router.get("/", listarPacientes);

module.exports = router;
