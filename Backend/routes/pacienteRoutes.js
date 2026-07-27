const express = require("express");
const router = express.Router();
const {
  crearPaciente,
  listarPacientes,
} = require("../controllers/pacienteController");
const { proteger, autorizar } = require("../middleware/auth");

// Ruta para crear un nuevo paciente (solo admin)
router.post("/", proteger, autorizar("admin", "administrador"), crearPaciente);

// Ruta para listar todos los pacientes (autenticados)
router.get("/", proteger, listarPacientes);

module.exports = router;
