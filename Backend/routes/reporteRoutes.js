const express = require("express");
const router = express.Router();

const { proteger, autorizar } = require("../middleware/auth");
const {
  citasPorMes,
  pacientesFrecuentes,
  citasPorEstado,
} = require("../controllers/reporteController");

router.get(
  "/estados",
  proteger,
  autorizar("admin", "administrador"),
  citasPorEstado,
);
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
