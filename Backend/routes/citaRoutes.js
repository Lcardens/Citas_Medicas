const express = require("express");
const router = express.Router();
const { proteger } = require("../middleware/auth");
const {
  listarCitas,
  crearCita,
  asignarCita,
  actualizarCita,
  eliminarCita,
  obtenerCitasPorMedico,
  obtenerCitasDisponiblesPorMedico,
} = require("../controllers/citaController");

// Rutas generales
router.get("/", proteger, listarCitas);
router.post("/", proteger, crearCita);
router.post("/asignar", proteger, asignarCita);

// 🟢 Añade estas dos rutas que ya tienes en el controlador pero faltaban en el router
router.get("/medico/:medicoId", proteger, obtenerCitasPorMedico);
router.get(
  "/disponibles/:medicoId",
  proteger,
  obtenerCitasDisponiblesPorMedico,
);

router.patch("/:id", proteger, actualizarCita);
router.delete("/:id", proteger, eliminarCita);

module.exports = router;
