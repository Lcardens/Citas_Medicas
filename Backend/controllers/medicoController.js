const Medico = require("../models/medico");
const Cita = require("../models/cita");
const User = require("../models/user");

exports.crearMedico = async (req, res) => {
  try {
    const { Registromedico, Nombre } = req.body;

    // Guardar el médico
    const nuevoMedico = new Medico({ Registromedico, Nombre });
    const medicoGuardado = await nuevoMedico.save();

    // Horarios por defecto del día
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

    const fechaHoy = new Date().toISOString().split("T")[0];

    // Generar las 10 citas automáticas asociadas a su _id
    const citasIniciales = horarios.map((hora) => ({
      medico: medicoGuardado._id,
      fecha: fechaHoy,
      hora,
      motivo: `Cita médica - ${hora}`,
      estado: "Disponible",
    }));

    await Cita.create(citasIniciales);

    res.status(201).json({
      exitoso: true,
      mensaje:
        "Médico creado y sus 10 cupos del día fueron generados exitosamente",
      datos: {
        medico: medicoGuardado,
        citasGeneradas: citasIniciales.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al crear el médico",
      error: error.message,
    });
  }
};

// Lista todos los médicos registrados
exports.listarMedicos = async (req, res) => {
  try {
    const medicos = await Medico.find();

    res.status(200).json({
      exitoso: true,
      mensaje: "Médicos obtenidos exitosamente",
      total: medicos.length,
      datos: medicos,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener los médicos",
      error: error.message,
    });
  }
};

// Actualiza la disponibilidad del médico
exports.actualizarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const diasAtencionBody = body.diasAtencion;
    const horasAtencionBody = body.horasAtencion;
    const diasBloqueadosBody = body.diasBloqueados;

    const medico = await Medico.findById(id);
    if (!medico) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Médico no encontrado",
      });
    }

    if (Array.isArray(diasAtencionBody)) {
      medico.diasAtencion = [...new Set(diasAtencionBody.map(Number))];
    }
    if (Array.isArray(horasAtencionBody)) {
      medico.horasAtencion = [...new Set(horasAtencionBody)];
    }
    if (Array.isArray(diasBloqueadosBody)) {
      medico.diasBloqueados = [
        ...new Set(diasBloqueadosBody.map((d) => String(d).slice(0, 10))),
      ];
    }

    await medico.save();

    const diasAtencion = medico.diasAtencion;
    const horasAtencion = medico.horasAtencion;
    const diasBloqueados = medico.diasBloqueados;

    // Limpiar cupos Disponibles que ya no corresponden a la configuración
    const cupos = await Cita.find({
      medico: id,
      estado: "Disponible",
      $or: [{ paciente: null }, { paciente: { $exists: false } }],
    });

    const aEliminar = [];
    for (const cupo of cupos) {
      const fechaStr = String(cupo.fecha || "").slice(0, 10);
      const diaSemana = new Date(`${fechaStr}T00:00:00`).getDay();
      const esBloqueado = diasBloqueados.includes(fechaStr);
      const esDiaValido = diasAtencion.includes(diaSemana);
      const esHoraValida = horasAtencion.includes(cupo.hora);
      if (esBloqueado || !esDiaValido || !esHoraValida) {
        aEliminar.push(cupo._id);
      }
    }

    if (aEliminar.length > 0) {
      await Cita.deleteMany({ _id: { $in: aEliminar } });
    }

    res.status(200).json({
      exitoso: true,
      mensaje: `Disponibilidad actualizada correctamente. ${aEliminar.length} cupo(s) retirado(s).`,
      datos: {
        diasAtencion: medico.diasAtencion,
        horasAtencion: medico.horasAtencion,
        diasBloqueados: medico.diasBloqueados,
        cuposRetirados: aEliminar.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al actualizar la disponibilidad",
      error: error.message,
    });
  }
};

// Eliminar médico en cascada: registro, usuario y citas
exports.eliminarMedico = async (req, res) => {
  try {
    const { id } = req.params;

    const medico = await Medico.findById(id);
    if (!medico) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Médico no encontrado",
      });
    }

    const correo = medico.email;

    // Eliminar citas del médico
    await Cita.deleteMany({ medico: id });

    // Eliminar el usuario vinculado por correo (si existe)
    if (correo) {
      await User.deleteOne({ email: correo.toLowerCase().trim() });
    }

    // Eliminar el registro del médico
    await Medico.findByIdAndDelete(id);

    res.status(200).json({
      exitoso: true,
      mensaje: "Médico y sus datos asociados eliminados exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al eliminar el médico",
      error: error.message,
    });
  }
};
