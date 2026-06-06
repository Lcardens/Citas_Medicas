const express = require("express");
const router = express.Router();
const {
  crearMedico,
  listarMedicos,
} = require("../controllers/medicoController");

// Ruta para crear un nuevo médico
router.post("/", crearMedico);

// Ruta para listar todos los médicos
router.get("/", listarMedicos);

module.exports = router;
