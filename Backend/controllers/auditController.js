const AuditLog = require("../models/auditLog");
const User = require("../models/user");

// Obtención de IP del cliente
const obtenerIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "desconocida"
  );
};

// Registra el evento de auditoría
exports.registrarEvento = async ({
  req,
  usuario,
  email,
  accion,
  entidad,
  entidadId,
  detalles,
}) => {
  try {
    await AuditLog.create({
      usuario: usuario?._id || null,
      email: email || usuario?.email || "sistema",
      accion,
      entidad,
      entidadId: entidadId ? String(entidadId) : null,
      detalles: detalles || {},
      ip: req ? obtenerIP(req) : "sistema",
    });
  } catch (err) {
    console.error("Error al registrar auditoría:", err.message);
  }
};

// GET /api/audit
exports.listarLogs = async (req, res) => {
  try {
    const {
      accion,
      usuario: usuarioBusqueda,
      usuarioId,
      fechaInicio,
      fechaFin,
      resumen,
      pagina = 1,
      limite = 20,
    } = req.query;

    const filtro = {};

    if (accion) filtro.accion = accion;

    if (usuarioId) {
      filtro.usuario = usuarioId;
    } else if (usuarioBusqueda) {
      const usuariosEncontrados = await User.find({
        $or: [
          { nombre: { $regex: usuarioBusqueda, $options: "i" } },
          { email: { $regex: usuarioBusqueda, $options: "i" } },
        ],
      }).select("_id email");
      if (usuariosEncontrados.length > 0) {
        const ids = usuariosEncontrados.map((u) => u._id);
        filtro.$or = [
          { usuario: { $in: ids } },
          { email: { $regex: usuarioBusqueda, $options: "i" } },
        ];
      } else {
        filtro.email = { $regex: usuarioBusqueda, $options: "i" };
      }
    }

    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fin;
      }
    }

    if (resumen === "1") {
      const todos = await AuditLog.find(filtro)
        .sort({ createdAt: -1 })
        .populate("usuario", "nombre email rol");

      const agrupados = {};
      for (const log of todos) {
        const clave = log.usuario
          ? String(log.usuario._id)
          : log.email || "sistema";
        if (!agrupados[clave]) {
          agrupados[clave] = {
            usuarioId: log.usuario ? log.usuario._id : null,
            nombre: log.usuario?.nombre || "Sistema",
            email: log.email,
            rol: log.usuario?.rol || "",
            total: 0,
            acciones: {},
            ultimaAccion: log.createdAt,
          };
        }
        agrupados[clave].total++;
        agrupados[clave].acciones[log.accion] =
          (agrupados[clave].acciones[log.accion] || 0) + 1;
      }

      const lista = Object.values(agrupados).sort(
        (a, b) => new Date(b.ultimaAccion).getTime() - new Date(a.ultimaAccion).getTime(),
      );

      return res.status(200).json({
        exitoso: true,
        datos: lista,
        total: lista.length,
      });
    }

    const total = await AuditLog.countDocuments(filtro);
    const pag = Math.max(1, parseInt(pagina));
    const lim = Math.min(100, Math.max(1, parseInt(limite)));
    const skip = (pag - 1) * lim;

    const logs = await AuditLog.find(filtro)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate("usuario", "nombre email rol");

    res.status(200).json({
      exitoso: true,
      datos: logs,
      total,
      pagina: pag,
      totalPaginas: Math.ceil(total / lim),
    });
  } catch (error) {
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al obtener logs de auditoría",
      error: error.message,
    });
  }
};
