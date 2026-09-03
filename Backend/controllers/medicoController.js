const Medico = require("../models/medico");
const Cita = require("../models/cita");
const User = require("../models/user");

exports.crearMedico = async (req, res) => {
  try {
    const { Registromedico, Nombre } = req.body;

    // Guardar el médico únicamente con su nombre
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

// Eliminar un médico en cascada: su registro, su usuario vinculado y sus citas
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
