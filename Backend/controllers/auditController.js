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
      pagina = 1,
      limite = 20,
    } = req.query;

    const filtro = {};

    if (accion) filtro.accion = accion;

    if (usuarioBusqueda) {
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
