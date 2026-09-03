const express = require("express");
const router = express.Router();
const {
  crearMedico,
  listarMedicos,
  eliminarMedico,
} = require("../controllers/medicoController");
const { proteger, autorizar } = require("../middleware/auth");

router.post("/", proteger, autorizar("admin", "administrador"), crearMedico);

router.get("/", listarMedicos);

router.delete(
  "/:id",
  proteger,
  autorizar("admin", "administrador"),
  eliminarMedico,
);

module.exports = router;
