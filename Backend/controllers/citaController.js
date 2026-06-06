const Cita = require("../models/cita");

// Crear un nueva cita
exports.crearCita = async (req, res) => {
  try {
    const { medico, fecha, motivo } = req.body;

    const nuevaCita = new Cita({
      medico,
      fecha,
      motivo,
    });

    // Guardar en MongoDB
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

// Asignar Cita
exports.asignarCita = async (req, res) => {
  try {
    const { citaId, pacienteId } = req.body;
    console.log(req.body);
    const cita = await Cita.findById(citaId);
    console.log(cita);
    if (cita == null || cita == undefined) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Cita no encontrada",
      });
    }

    cita.paciente = pacienteId;
    cita.estado = "Confirmada";
    await cita.save();

    res.status(200).json({
      exitoso: true,
      mensaje: "Cita asignada exitosamente",
      datos: cita,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al asignar cita",
      error: error.message,
    });
  }
};

// Listar citas
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
    console.log(req.params);
    const cita = await Cita.findByIdAndDelete(id);
    if (cita == null || cita == undefined) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Cita no encontrada",
      });
    } else {
      res.status(200).json({
        exitoso: true,
        mensaje: "Cita eliminada exitosamente",
      });
    }
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al eliminar cita",
      error: error.message,
    });
  }
};
