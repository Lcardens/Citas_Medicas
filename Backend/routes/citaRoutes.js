const express = require("express");
const router = express.Router();
const {
  crearCita,
  asignarCita,
  listarCitas,
  eliminarCita,
} = require("../controllers/citaController");

// Ruta para crear un nueva cita
router.post("/", crearCita);

// Ruta para asignar una cita a un paciente
router.patch("/asignar", asignarCita);

// Ruta para listar todas las citas
router.get("/", listarCitas);

// Ruta para eliminar una cita
router.delete("/:id", eliminarCita);

module.exports = router;
