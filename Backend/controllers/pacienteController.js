const Paciente = require("../models/Paciente");

// Crear un nuevo paciente
exports.crearPaciente = async (req, res) => {
  try {
    const {
      TipoDocumento,
      Documento,
      Nombre,
      Apellido,
      Correo,
      Telefono,
      Direccion,
      Genero,
      FechaNacimiento,
      TipoSangre,
      Alergias,
      Enfermedades,
      ContactoEmergencia,
    } = req.body;

    const nuevoPaciente = new Paciente({
      TipoDocumento,
      Documento,
      Nombre,
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

// Listar todos los Medicos
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
