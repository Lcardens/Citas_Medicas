const Cita = require("../models/cita");
const Paciente = require("../models/Paciente");
const Medico = require("../models/medico");
const { registrarEvento } = require("./auditController");

// Horarios de atención fijos
const HORARIOS = [
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

// Genera los cupos que faltan para un médico/fecha
const crearCuposSiNoExisten = async (medicoId, fecha) => {
  const medico = await Medico.findById(medicoId).select(
    "diasAtencion horasAtencion diasBloqueados",
  );
  if (!medico) return { creados: 0 };

  const fechaStr = String(fecha || "").slice(0, 10);
  const fechaObj = new Date(`${fechaStr}T00:00:00`);
  const diaSemana = fechaObj.getDay();

  const diasAtencion = Array.isArray(medico.diasAtencion)
    ? medico.diasAtencion
    : [];
  const horasAtencion = Array.isArray(medico.horasAtencion)
    ? medico.horasAtencion
    : HORARIOS;
  const diasBloqueados = Array.isArray(medico.diasBloqueados)
    ? medico.diasBloqueados
    : [];

  const esBloqueado = diasBloqueados.some((d) => {
    const f = typeof d === "string" ? d : d?.fecha;
    return String(f || "").slice(0, 10) === fechaStr;
  });

  if (esBloqueado) {
    return { creados: 0, bloqueado: true };
  }
  if (!diasAtencion.includes(diaSemana)) {
    return { creados: 0, bloqueado: true };
  }

  const citasExistentes = await Cita.find({ medico: medicoId, fecha: fechaStr });

  const horasOcupadas = new Set(
    citasExistentes
      .filter(
        (cita) =>
          cita.estado === "Confirmada" || cita.estado === "Disponible",
      )
      .map((cita) => cita.hora),
  );

  const horasFaltantes = horasAtencion.filter(
    (hora) => !horasOcupadas.has(hora),
  );

  if (horasFaltantes.length === 0) {
    return { creados: 0 };
  }

  const nuevasCitas = horasFaltantes.map((hora) => ({
    medico: medicoId,
    fecha: fechaStr,
    hora,
    motivo: `Cita médica - ${hora}`,
    estado: "Disponible",
  }));

  await Cita.create(nuevasCitas);
  return { creados: nuevasCitas.length };
};

// Obtiene o crea el paciente del usuario logueado
const resolverPacientePorUsuario = async (usuarioLogueado) => {
  const correo = usuarioLogueado.email;
  let paciente = await Paciente.findOne({ Correo: correo });

  if (!paciente) {
    paciente = await Paciente.create({
      TipoDocumento: "CC",
      Documento: correo,
      Nombre: usuarioLogueado.nombre || correo,
      Correo: correo,
      Telefono: "Sin registro",
    });
  }

  return paciente;
};

const estadosOcupados = ["Confirmada", "Reservada"];

const existeConflictoHora = async (medico, fecha, hora, ignorarId) => {
  const query = { medico, fecha, hora, estado: { $in: estadosOcupados } };
  if (ignorarId) query._id = { $ne: ignorarId };
  return Cita.findOne(query);
};

const pacienteTieneCitaEseDia = async (paciente, fecha, ignorarId) => {
  const query = {
    paciente,
    fecha,
    estado: { $in: [...estadosOcupados, "Disponible"] },
  };
  if (ignorarId) query._id = { $ne: ignorarId };
  return Cita.findOne(query);
};

const validarCitaNueva = async ({
  paciente,
  medico,
  fecha,
  hora,
  ignorarId,
}) => {
  const conflicto = await existeConflictoHora(medico, fecha, hora, ignorarId);
  if (conflicto) {
    return {
      error: `Ya existe una cita ocupada para este médico a las ${hora} el día ${fecha}.`,
    };
  }

  if (paciente) {
    const yaCitaDia = await pacienteTieneCitaEseDia(paciente, fecha, ignorarId);
    if (yaCitaDia) {
      return {
        error: "El paciente ya tiene una cita asignada para esta fecha (máximo 1 por día).",
      };
    }
  }

  return { error: null };
};

// Crear una cita manual
exports.crearCita = async (req, res) => {
  try {
    let { paciente, medico, fecha, hora, motivo } = req.body;

    if (!medico || !fecha || !hora) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Faltan campos obligatorios (médico, fecha u hora)",
      });
    }

    // Paciente logueado: resolver su perfil automáticamente
    const usuarioLogueado = req.usuario || req.user;
    const rolUsuario = (usuarioLogueado?.rol || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (rolUsuario === "paciente" || rolUsuario === "usuario") {
      const pacienteResuelto = await resolverPacientePorUsuario(usuarioLogueado);
      paciente = pacienteResuelto._id;
    }

    // Si el usuario es médico, solo crea para sí mismo
    if (rolUsuario === "medico") {
      const medicoVinculado = await Medico.findOne({ email: usuarioLogueado.email });
      if (!medicoVinculado) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "No se encontró un perfil de médico vinculado a tu cuenta.",
        });
      }
      if (String(medico) !== String(medicoVinculado._id)) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "Solo puedes crear citas para ti mismo.",
        });
      }
    }

    if (!paciente) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Falta el paciente. Un paciente debe indicar su perfil.",
      });
    }

    const medicoExiste = await Medico.findById(medico);
    if (!medicoExiste) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "El médico seleccionado no existe.",
      });
    }

    // Validar conflictos de horario y máximo una cita por día por paciente
    const { error: errorValidacion } = await validarCitaNueva({
      paciente,
      medico,
      fecha,
      hora,
    });
    if (errorValidacion) {
      return res.status(400).json({
        exitoso: false,
        mensaje: errorValidacion,
      });
    }

    // Reutilizar cupo "Disponible" sin paciente en esa hora
    const cupoDisponible = await Cita.findOne({
      medico,
      fecha,
      hora,
      estado: "Disponible",
      $or: [{ paciente: null }, { paciente: { $exists: false } }],
    });

    let citaGuardada;
    if (cupoDisponible) {
      cupoDisponible.paciente = paciente;
      cupoDisponible.estado = "Confirmada";
      cupoDisponible.motivo = motivo || cupoDisponible.motivo;
      citaGuardada = await cupoDisponible.save();
    } else {
      const nuevaCita = new Cita({
        paciente,
        medico,
        fecha,
        hora,
        motivo,
        estado: "Confirmada",
      });
      citaGuardada = await nuevaCita.save();
    }

    const citaPoblada = await Cita.findById(citaGuardada._id)
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

    await registrarEvento({
      req,
      usuario: usuarioLogueado,
      accion: "crear_cita",
      entidad: "cita",
      entidadId: citaGuardada._id,
      detalles: { fecha, hora, motivo, estado: "Confirmada" },
    });

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
    let { medicoId, pacienteId, fecha } = req.body;

    const fechaConsulta = fecha || new Date().toISOString().split("T")[0];

    // Si es paciente y no se envía pacienteId, resolver su perfil
    const usuarioLogueado = req.usuario || req.user;
    const rolUsuario = (usuarioLogueado?.rol || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (!pacienteId && (rolUsuario === "paciente" || rolUsuario === "usuario")) {
      const pacienteResuelto = await resolverPacientePorUsuario(usuarioLogueado);
      pacienteId = pacienteResuelto._id;
    }

    if (!pacienteId) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Falta el paciente. Un paciente debe indicar su perfil.",
      });
    }

    if (!medicoId) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Falta el médico.",
      });
    }

    const medicoExiste = await Medico.findById(medicoId);
    if (!medicoExiste) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "El médico no existe.",
      });
    }

    // Evitar que el paciente tenga más de una cita el mismo día
    const yaTieneCitaDia = await pacienteTieneCitaEseDia(
      pacienteId,
      fechaConsulta,
    );
    if (yaTieneCitaDia) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "El paciente ya tiene una cita asignada para esta fecha (máximo 1 por día).",
      });
    }

    await crearCuposSiNoExisten(medicoId, fechaConsulta);

    const citaDisponible = await Cita.findOne({
      medico: medicoId,
      fecha: fechaConsulta,
      estado: "Disponible",
      $or: [{ paciente: null }, { paciente: { $exists: false } }],
    }).sort({ hora: 1 });

    if (!citaDisponible) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "El médico no tiene cupos disponibles para esta fecha.",
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

// Asignación rápida: primer médico con cupo disponible
exports.asignarCitaRapida = async (req, res) => {
  try {
    let { pacienteId, fecha } = req.body;

    const usuarioLogueado = req.usuario || req.user;
    const rolUsuario = (usuarioLogueado?.rol || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Requiere ser paciente/usuario autenticado
    if (rolUsuario !== "paciente" && rolUsuario !== "usuario") {
      return res.status(403).json({
        exitoso: false,
        mensaje: "Solo los pacientes pueden usar la asignación rápida.",
      });
    }

    if (!pacienteId) {
      const pacienteResuelto = await resolverPacientePorUsuario(usuarioLogueado);
      pacienteId = pacienteResuelto._id;
    }

    if (!pacienteId) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Falta el paciente.",
      });
    }

    const fechaDesde = fecha || new Date().toISOString().split("T")[0];

    // Días en los que el paciente ya tiene una cita ocupada (máximo 1 cita por día)
    const diasOcupadosPaciente = await Cita.find({
      paciente: pacienteId,
      estado: { $in: ["Confirmada", "Reservada", "Disponible"] },
      fecha: { $gte: fechaDesde },
    }).select("fecha");

    const fechasOcupadas = [
      ...new Set(diasOcupadosPaciente.map((c) => String(c.fecha).slice(0, 10))),
    ];

    // Busca el próximo cupo disponible en un día en que el paciente no tenga cita
    let cupoFinal = await Cita.findOne({
      estado: "Disponible",
      fecha: { $gte: fechaDesde, $nin: fechasOcupadas },
      $or: [{ paciente: null }, { paciente: { $exists: false } }],
    })
      .sort({ fecha: 1, hora: 1 })
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

    if (!cupoFinal) {
      // Generar cupos desde hoy (o la fecha dada) hasta 30 días, saltando días ocupados
      const medicoReferencia = await Medico.findOne()
        .sort({ createdAt: 1 })
        .select("_id");
      if (medicoReferencia) {
        const fechaBase = new Date(`${fechaDesde}T00:00:00`);
        for (let i = 0; i <= 30 && !cupoFinal; i++) {
          const fechaGenerar = new Date(fechaBase);
          fechaGenerar.setDate(fechaGenerar.getDate() + i);
          const fechaStr = fechaGenerar.toISOString().split("T")[0];

          if (fechasOcupadas.includes(fechaStr)) continue;

          await crearCuposSiNoExisten(medicoReferencia._id, fechaStr);

          cupoFinal = await Cita.findOne({
            estado: "Disponible",
            fecha: fechaStr,
            $or: [{ paciente: null }, { paciente: { $exists: false } }],
          })
            .sort({ fecha: 1, hora: 1 })
            .populate(
              "medico",
              "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
            );
        }
      }
    }

    if (!cupoFinal) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "No hay cupos disponibles en días libres para el paciente.",
      });
    }

    const medicoFinalId =
      cupoFinal.medico && cupoFinal.medico._id
        ? cupoFinal.medico._id
        : cupoFinal.medico;

    const nombreMedicoFinal =
      cupoFinal.medico && typeof cupoFinal.medico === "object"
        ? cupoFinal.medico.Nombre || cupoFinal.medico.nombre || "el médico"
        : "el médico";

    cupoFinal.paciente = pacienteId;
    cupoFinal.estado = "Confirmada";
    await cupoFinal.save();

    const citaPoblada = await Cita.findById(cupoFinal._id)
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
      mensaje: `Cita asignada automáticamente con ${nombreMedicoFinal} el ${cupoFinal.fecha} a las ${cupoFinal.hora}.`,
      datos: citaPoblada,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error en la asignación rápida",
      error: error.message,
    });
  }
};

// Listar citas (los pacientes solo ven las suyas)
exports.listarCitas = async (req, res) => {
  try {
    let filtro = {};
    let esPaciente = false;
    const usuarioLogueado = req.usuario || req.user;

    if (usuarioLogueado) {
      const rol = (usuarioLogueado.rol || "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (rol === "paciente" || rol === "usuario") {
        esPaciente = true;
        const pacienteEncontrado = await resolverPacientePorUsuario(
          usuarioLogueado,
        );
        filtro.paciente = pacienteEncontrado._id;
      }
    }

    const citas = await Cita.find(filtro)
      .sort({ fecha: 1, hora: 1 })
      .populate(
        "paciente",
        "Nombre nombre nombres nombreCompleto documento Documento email Correo",
      )
      .populate(
        "medico",
        "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
      );

    // Para pacientes, devolver también los cupos disponibles
    let citasDisponibles = [];
    if (esPaciente) {
      const hoy = new Date().toISOString().split("T")[0];
      citasDisponibles = await Cita.find({
        estado: "Disponible",
        fecha: { $gte: hoy },
        $or: [{ paciente: null }, { paciente: { $exists: false } }],
      })
        .sort({ fecha: 1, hora: 1 })
        .populate(
          "medico",
          "Nombre nombre nombres nombreCompleto Registromedico registroMedico email",
        );
    }

    res.status(200).json({
      exitoso: true,
      mensaje: "Citas listadas exitosamente",
      datos: citas,
      disponibles: citasDisponibles,
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

    const cita = await Cita.findById(id);
    if (!cita) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Cita no encontrada",
      });
    }

    // Si el usuario es médico, solo puede eliminar sus propias citas
    const usuarioLogueado = req.usuario || req.user;
    const rolUsuario = (usuarioLogueado?.rol || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (rolUsuario === "medico") {
      const medicoVinculado = await Medico.findOne({ email: usuarioLogueado.email });
      if (!medicoVinculado) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "No se encontró un perfil de médico vinculado a tu cuenta.",
        });
      }
      if (String(cita.medico) !== String(medicoVinculado._id)) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "Solo puedes eliminar citas que te pertenezcan.",
        });
      }
    }

    await Cita.findByIdAndDelete(id);

    await registrarEvento({
      req,
      usuario: usuarioLogueado,
      accion: "eliminar_cita",
      entidad: "cita",
      entidadId: id,
      detalles: { fecha: cita.fecha, hora: cita.hora },
    });

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

    // Solo cupos sin asignar desde hoy en adelante
    const hoy = new Date().toISOString().split("T")[0];

    const citasDisponibles = await Cita.find({
      medico: medicoId,
      estado: "Disponible",
      fecha: { $gte: hoy },
      $or: [{ paciente: null }, { paciente: { $exists: false } }],
    })
      .sort({ fecha: 1, hora: 1 })
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

// Horas disponibles de un médico para una fecha concreta
exports.obtenerHorasDisponiblesPorMedicoYFecha = async (req, res) => {
  try {
    const { medicoId, fecha } = req.params;

    if (!fecha) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Falta la fecha.",
      });
    }

    // Asegurar cupos generados para esa fecha
    await crearCuposSiNoExisten(medicoId, fecha);

    const horasDisponibles = await Cita.find({
      medico: medicoId,
      fecha,
      estado: "Disponible",
      $or: [{ paciente: null }, { paciente: { $exists: false } }],
    })
      .sort({ hora: 1 })
      .select("hora fecha medico");

    res.status(200).json({
      exitoso: true,
      mensaje: "Horas disponibles obtenidas exitosamente",
      totalDisponibles: horasDisponibles.length,
      horas: horasDisponibles.map((c) => c.hora),
      datos: horasDisponibles,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener las horas disponibles",
      error: error.message,
    });
  }
};

// Disponibilidad por día de un médico en un rango de fechas
exports.obtenerDisponibilidadPorRango = async (req, res) => {
  try {
    const { medicoId } = req.params;
    const { inicio, fin } = req.query;

    if (!inicio || !fin) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Faltan las fechas de inicio y fin.",
      });
    }

    const resumen = {};
    const cursorDate = new Date(`${inicio}T00:00:00`);
    const ultimoDate = new Date(`${fin}T00:00:00`);

    while (cursorDate <= ultimoDate) {
      const fechaISO = cursorDate.toISOString().split("T")[0];
      const horasDisponibles = await Cita.countDocuments({
        medico: medicoId,
        fecha: fechaISO,
        estado: "Disponible",
        $or: [{ paciente: null }, { paciente: { $exists: false } }],
      });
      if (horasDisponibles > 0) {
        resumen[fechaISO] = true;
      }
      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    res.status(200).json({
      exitoso: true,
      mensaje: "Disponibilidad obtenida exitosamente",
      disponibilidad: resumen,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener la disponibilidad",
      error: error.message,
    });
  }
};

// Agenda del médico logueado
exports.agendaDelMedico = async (req, res) => {
  try {
    const usuarioLogueado = req.usuario || req.user;
    if (!usuarioLogueado) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "No autorizado",
      });
    }

    // Busca el médico vinculado por correo; si no, por nombre
    let medico = await Medico.findOne({ email: usuarioLogueado.email });
    if (!medico) {
      medico = await Medico.findOne({
        Nombre: { $regex: new RegExp(`^${usuarioLogueado.nombre.trim()}$`, "i") },
      });
    }

    if (!medico) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "No se encontró un perfil de médico vinculado a tu cuenta.",
        datos: [],
      });
    }

    const citas = await Cita.find({
      medico: medico._id,
      estado: { $in: ["Confirmada", "Atendida"] },
    })
      .sort({ fecha: 1, hora: 1 })
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
      mensaje: "Agenda del médico obtenida exitosamente",
      totalCitas: citas.length,
      medicoId: medico._id,
      datos: citas,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener la agenda del médico",
      error: error.message,
    });
  }
};

// Actualizar/Modificar Cita (PATCH)
exports.actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioLogueado = req.usuario || req.user;
    const rolUsuario = (usuarioLogueado?.rol || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const esAdmin = rolUsuario === "admin" || rolUsuario === "administrador";

    // Whitelist: solo ciertos campos, según el rol
    const camposBase = ["motivo", "estado", "diagnostico", "notasConsulta"];
    const camposAdmin = [...camposBase, "fecha", "hora", "paciente", "medico"];
    const camposPermitidos = esAdmin ? camposAdmin : camposBase;
    const camposActualizar = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        camposActualizar[campo] = req.body[campo];
      }
    }

    // Si el usuario es médico, solo puede modificar sus propias citas
    if (rolUsuario === "medico") {
      const medicoVinculado = await Medico.findOne({ email: usuarioLogueado.email });
      if (!medicoVinculado) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "No se encontró un perfil de médico vinculado a tu cuenta.",
        });
      }
      const cita = await Cita.findById(id);
      if (!cita) {
        return res.status(404).json({
          exitoso: false,
          mensaje: "Cita no encontrada",
        });
      }
      if (String(cita.medico) !== String(medicoVinculado._id)) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "Solo puedes modificar citas que te pertenezcan.",
        });
      }
    }

    // Admin: validar conflictos al cambiar fecha/hora/paciente/medico
    if (esAdmin) {
      const esEdicionAdmin = ["fecha", "hora", "paciente", "medico"].some(
        (c) => camposActualizar[c] !== undefined,
      );
      if (esEdicionAdmin) {
        const citaActual = await Cita.findById(id);
        if (citaActual) {
          const nuevaFecha = camposActualizar.fecha ?? citaActual.fecha;
          const nuevaHora = camposActualizar.hora ?? citaActual.hora;
          const nuevoPaciente = camposActualizar.paciente ?? citaActual.paciente;
          const nuevoMedico = camposActualizar.medico ?? citaActual.medico;
          const { error: errorValidacion } = await validarCitaNueva({
            paciente: nuevoPaciente,
            medico: nuevoMedico,
            fecha: nuevaFecha,
            hora: nuevaHora,
            ignorarId: id,
          });
          if (errorValidacion) {
            return res.status(400).json({
              exitoso: false,
              mensaje: errorValidacion,
            });
          }
        }
      }
    }

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

    await registrarEvento({
      req,
      usuario: usuarioLogueado,
      accion: "actualizar_cita",
      entidad: "cita",
      entidadId: id,
      detalles: { campos: Object.keys(camposActualizar), ...camposActualizar },
    });

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
