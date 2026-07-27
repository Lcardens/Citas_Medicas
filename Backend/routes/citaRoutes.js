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
  actualizarCita, // 👈 Se importa directamente aquí
} = require("../controllers/citaController");

// 🔒 Aplica el chequeo de token a ABSOLUTAMENTE TODAS las rutas de abajo
router.use(proteger);

router.get("/", listarCitas);
router.post("/", autorizar("admin", "medico"), crearCita);
router.patch("/asignar", autorizar("admin"), asignarCita);
router.delete("/:id", autorizar("admin"), eliminarCita);
router.get("/medico/:medicoId", obtenerCitasPorMedico);
router.get("/medico/:medicoId/disponibles", obtenerCitasDisponiblesPorMedico);

// 👈 Se llama directamente por su nombre
router.patch("/:id", autorizar("admin", "medico"), actualizarCita);

module.exports = router;
