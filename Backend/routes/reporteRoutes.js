const express = require("express");
const router = express.Router();

const { proteger, autorizar } = require("../middleware/auth");
const {
  citasPorMes,
  pacientesFrecuentes,
} = require("../controllers/reporteController");

router.get(
  "/citas-por-mes",
  proteger,
  autorizar("admin", "administrador"),
  citasPorMes,
);
router.get(
  "/pacientes-frecuentes",
  proteger,
  autorizar("admin", "administrador"),
  pacientesFrecuentes,
);

module.exports = router;
