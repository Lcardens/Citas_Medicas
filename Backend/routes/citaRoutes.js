const express = require("express");
const router = express.Router();
const { proteger, autorizar } = require("../middleware/auth");
const {
  listarCitas,
  crearCita,
  asignarCita,
  asignarCitaRapida,
  actualizarCita,
  eliminarCita,
  obtenerCitasPorMedico,
  obtenerCitasDisponiblesPorMedico,
  obtenerHorasDisponiblesPorMedicoYFecha,
  obtenerDisponibilidadPorRango,
  agendaDelMedico,
} = require("../controllers/citaController");

router.get("/", proteger, listarCitas);
router.post("/", proteger, crearCita);
router.post("/asignar", proteger, asignarCita);
router.post("/asignar-rapido", proteger, asignarCitaRapida);

router.get("/agenda", proteger, agendaDelMedico);

router.get("/medico/:medicoId", proteger, obtenerCitasPorMedico);
router.get(
  "/disponibles/:medicoId",
  proteger,
  obtenerCitasDisponiblesPorMedico,
);
router.get(
  "/disponibles/:medicoId/:fecha",
  proteger,
  obtenerHorasDisponiblesPorMedicoYFecha,
);
router.get(
  "/disponibilidad/:medicoId",
  proteger,
  obtenerDisponibilidadPorRango,
);

router.patch("/:id", proteger, actualizarCita);
router.delete(
  "/:id",
  proteger,
  autorizar("admin", "administrador"),
  eliminarCita
);

module.exports = router;
