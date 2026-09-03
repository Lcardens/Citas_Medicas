const Paciente = require("../models/Paciente");
const User = require("../models/user");
const Cita = require("../models/cita");

// Crear un nuevo paciente
exports.crearPaciente = async (req, res) => {
  try {
    const { TipoDocumento, Documento, Nombre, Apellido, Correo, Telefono } =
      req.body;

    const nuevoPaciente = new Paciente({
      TipoDocumento,
      Documento,
      Nombre,
      Apellido,
      Correo,
      Telefono,
    });

    // Guardar en MongoDB
    const paciente = await nuevoPaciente.save();

    res.status(201).json({
      exitoso: true,
      mensaje: "Paciente creado exitosamente",
      datos: paciente,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al crear paciente",
      error: error.message,
    });
  }
};

// Listar todos los pacientes
exports.listarPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find();
    res.status(200).json({
      exitoso: true,
      mensaje: "Pacientes listados exitosamente",
      datos: pacientes,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al listar pacientes",
      error: error.message,
    });
  }
};

// Eliminar paciente en cascada: registro, usuario y citas
exports.eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Paciente no encontrado",
      });
    }

    const correo = paciente.Correo;

    // Eliminar citas del paciente
    await Cita.deleteMany({ paciente: id });

    // Eliminar el usuario vinculado por correo (si existe)
    if (correo) {
      await User.deleteOne({ email: correo.toLowerCase().trim() });
    }

    // Eliminar el registro del paciente
    await Paciente.findByIdAndDelete(id);

    res.status(200).json({
      exitoso: true,
      mensaje: "Paciente y sus datos asociados eliminados exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al eliminar paciente",
      error: error.message,
    });
  }
};
