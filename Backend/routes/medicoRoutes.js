const express = require("express");
const router = express.Router();
const {
  crearMedico,
  listarMedicos,
  eliminarMedico,
  actualizarDisponibilidad,
} = require("../controllers/medicoController");
const { proteger, autorizar } = require("../middleware/auth");

router.post("/", proteger, autorizar("admin", "administrador"), crearMedico);

router.get("/", listarMedicos);

router.put(
  "/:id/disponibilidad",
  proteger,
  autorizar("admin", "administrador"),
  actualizarDisponibilidad,
);

router.delete(
  "/:id",
  proteger,
  autorizar("admin", "administrador"),
  eliminarMedico,
);

module.exports = router;
