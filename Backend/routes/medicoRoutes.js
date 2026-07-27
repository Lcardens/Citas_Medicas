const express = require("express");
const router = express.Router();
const {
  crearMedico,
  listarMedicos,
} = require("../controllers/medicoController");
const { proteger, autorizar } = require("../middleware/auth");

// Ruta para crear un nuevo médico (solo admin)
router.post("/", proteger, autorizar("admin", "administrador"), crearMedico);

// Ruta para listar todos los médicos
router.get("/", listarMedicos);

module.exports = router;
