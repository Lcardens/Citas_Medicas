const express = require("express");
const router = express.Router();
const { proteger, autorizar } = require("../middleware/auth");
const {
  crearCita,
  asignarCita,
  listarCitas,
  eliminarCita,
  obtenerCitasPorMedico,
  obtenerCitasDisponiblesPorMedico,
} = require("../controllers/citaController");

router.post("/", proteger, crearCita);
router.patch("/asignar", proteger, autorizar("admin"), asignarCita);
router.get("/", listarCitas);
router.delete("/:id", proteger, autorizar("admin"), eliminarCita);
router.get("/medico/:medicoId", proteger, obtenerCitasPorMedico);
router.get(
  "/medico/:medicoId/disponibles",
  proteger,
  obtenerCitasDisponiblesPorMedico,
);

module.exports = router;
