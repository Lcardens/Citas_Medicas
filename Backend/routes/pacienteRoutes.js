const express = require("express");
const router = express.Router();
const {
  crearPaciente,
  listarPacientes,
  eliminarPaciente,
} = require("../controllers/pacienteController");
const { proteger, autorizar } = require("../middleware/auth");

router.post("/", proteger, autorizar("admin", "administrador"), crearPaciente);

router.get("/", proteger, listarPacientes);

router.delete(
  "/:id",
  proteger,
  autorizar("admin", "administrador"),
  eliminarPaciente,
);

module.exports = router;
