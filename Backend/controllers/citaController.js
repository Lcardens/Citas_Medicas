const Cita = require("../models/cita");
const Paciente = require("../models/Paciente");

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
    hora,
    motivo: `Cita médica - ${hora}`,
    estado: "Disponible",
  }));

  await Cita.insertMany(nuevasCitas);
};

// Crear una nueva cita manual
exports.crearCita = async (req, res) => {
  try {
    const { paciente, medico, fecha, hora, motivo } = req.body;

    if (!paciente || !medico || !fecha || !hora) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Faltan campos obligatorios (paciente, médico, fecha u hora)",
      });
    }

    const nuevaCita = new Cita({
      paciente: paciente || null,
      medico,
      fecha,
      hora,
      motivo,
      estado: paciente ? "Confirmada" : "Disponible",
    });

    const citaGuardada = await nuevaCita.save();

    const citaPoblada = await Cita.findById(citaGuardada._id)
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

    res.status(201).json({
      exitoso: true,
      mensaje: "Cita creada exitosamente",
      datos: citaPoblada,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al crear la cita",
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

    const citaPoblada = await Cita.findById(citaDisponible._id)
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

    const cuposRestantes = await Cita.countDocuments({
      medico: medicoId,
      fecha: fechaConsulta,
      estado: "Disponible",
    });

    res.status(200).json({
      exitoso: true,
      mensaje: `Cita asignada exitosamente. Le quedan ${cuposRestantes} cupos disponibles.`,
      datos: citaPoblada,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al asignar cita",
      error: error.message,
    });
  }
};

// Listar citas (filtrado automático: si es paciente, solo ve las suyas)
exports.listarCitas = async (req, res) => {
  try {
    let filtro = {};
    const usuarioLogueado = req.usuario || req.user;

    if (usuarioLogueado) {
      const rol = (usuarioLogueado.rol || "").toLowerCase().trim();
      if (rol === "paciente" || rol === "usuario") {
        let pacienteEncontrado = await Paciente.findOne({
          Correo: usuarioLogueado.email,
        });

        if (!pacienteEncontrado) {
          pacienteEncontrado = await Paciente.create({
            TipoDocumento: "CC",
            Documento: usuarioLogueado.email,
            Nombre: usuarioLogueado.nombre || usuarioLogueado.email,
            Correo: usuarioLogueado.email,
            Telefono: "Sin registro",
          });
          console.log("Paciente creado desde listarCitas:", pacienteEncontrado._id, usuarioLogueado.email);
        }

        filtro.paciente = pacienteEncontrado._id;
      }
    }

    const citas = await Cita.find(filtro)
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

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

    const citas = await Cita.find({ medico: medicoId })
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

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

    const citasDisponibles = await Cita.find({
      medico: medicoId,
      estado: "Disponible",
    })
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

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

// Actualizar/Modificar Cita (Método PATCH)
exports.actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      { $set: camposActualizar },
      { new: true, runValidators: true },
    )
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

    if (!citaActualizada) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Cita no encontrada",
      });
    }

    res.status(200).json({
      exitoso: true,
      mensaje: "Cita actualizada exitosamente",
      datos: citaActualizada,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al actualizar la cita",
      error: error.message,
    });
  }
};
