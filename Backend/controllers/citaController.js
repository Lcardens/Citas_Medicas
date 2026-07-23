const Cita = require("../models/cita");
const User = require("../models/user");

// Función auxiliar interna para generar los 10 cupos
const crearCuposSiNoExisten = async (medicoId, fecha) => {
  const horarios = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  const citasExistentes = await Cita.find({ medico: medicoId, fecha: fecha });
  if (citasExistentes.length > 0) return;

  const nuevasCitas = horarios.map((hora) => ({
    medico: medicoId,
    fecha: fecha,
    motivo: `Cita médica - ${hora}`,
    estado: "Disponible",
  }));

  await Cita.insertMany(nuevasCitas);
};

// Crear una nueva cita manual
exports.crearCita = async (req, res) => {
  try {
    const { medico, fecha, motivo } = req.body;

    const nuevaCita = new Cita({
      medico,
      fecha,
      motivo,
      estado: "Disponible",
    });

    const cita = await nuevaCita.save();

    res.status(201).json({
      exitoso: true,
      mensaje: "Cita creada exitosamente",
      datos: cita,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al crear cita",
      error: error.message,
    });
  }
};

// Asignar Cita Automática
exports.asignarCita = async (req, res) => {
  try {
    const { medicoId, pacienteId, fecha } = req.body;

    const fechaConsulta = fecha || new Date().toISOString().split("T")[0];

    await crearCuposSiNoExisten(medicoId, fechaConsulta);

    const citaDisponible = await Cita.findOne({
      medico: medicoId,
      fecha: fechaConsulta,
      estado: "Disponible",
    });

    if (!citaDisponible) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "El médico no tiene cupos/citas disponibles para esta fecha.",
      });
    }

    citaDisponible.paciente = pacienteId;
    citaDisponible.estado = "Confirmada";
    await citaDisponible.save();

    const cuposRestantes = await Cita.countDocuments({
      medico: medicoId,
      fecha: fechaConsulta,
      estado: "Disponible",
    });

    res.status(200).json({
      exitoso: true,
      mensaje: `Cita asignada exitosamente. Le quedan ${cuposRestantes} cupos disponibles.`,
      datos: citaDisponible,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al asignar cita",
      error: error.message,
    });
  }
};

// Listar citas (sin que marque error en populate)
exports.listarCitas = async (req, res) => {
  try {
    const citas = await Cita.find().populate("paciente").populate("medico");
    res.status(200).json({
      exitoso: true,
      mensaje: "Citas listadas exitosamente",
      datos: citas,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al listar citas",
      error: error.message,
    });
  }
};

// Eliminar cita
exports.eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findByIdAndDelete(id);

    if (!cita) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Cita no encontrada",
      });
    }

    res.status(200).json({
      exitoso: true,
      mensaje: "Cita eliminada exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al eliminar cita",
      error: error.message,
    });
  }
};
exports.obtenerCitasPorMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;

    // Buscamos todas las citas que pertenezcan a ese médico
    const citas = await Cita.find({ medico: medicoId })
      .populate("paciente", "nombre email") // Trae solo nombre y email del paciente
      .populate("medico", "nombre email");

    res.status(200).json({
      exitoso: true,
      mensaje: "Citas del médico obtenidas exitosamente",
      totalCitas: citas.length,
      datos: citas,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener las citas del médico",
      error: error.message,
    });
  }
};
exports.obtenerCitasDisponiblesPorMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;

    // Filtramos por el ID del médico Y que el estado sea "Disponible"
    const citasDisponibles = await Cita.find({
      medico: medicoId,
      estado: "Disponible",
    }).populate("medico", "nombre email");

    res.status(200).json({
      exitoso: true,
      mensaje: "Citas disponibles obtenidas exitosamente",
      totalDisponibles: citasDisponibles.length,
      datos: citasDisponibles,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener las citas disponibles",
      error: error.message,
    });
  }
};
