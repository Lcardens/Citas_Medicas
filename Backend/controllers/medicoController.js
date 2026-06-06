const Medico = require("../models/Medico");

// Crear un nuevo Medico
exports.crearMedico = async (req, res) => {
  try {
    const { Registromedico, Nombre } = req.body;

    const nuevoMedico = new Medico({
      Registromedico,
      Nombre,
    });

    // Guardar en MongoDB
    const medico = await nuevoMedico.save();

    res.status(201).json({
      exitoso: true,
      mensaje: "Médico creado exitosamente",
      datos: medico,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al crear médico",
      error: error.message,
    });
  }
};

// Listar todos los Medicos
exports.listarMedicos = async (req, res) => {
  try {
    const medicos = await Medico.find();
    res.status(200).json({
      exitoso: true,
      mensaje: "Médicos listados exitosamente",
      datos: medicos,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al listar médicos",
      error: error.message,
    });
  }
};
