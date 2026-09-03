const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware: protege rutas (verifica el token)
exports.proteger = async (req, res, next) => {
  try {
    let token;

    // Lee el token del header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Sin token, denegar acceso
    if (!token) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "No autorizado, no hay token",
      });
    }

    // Verifica el token; lanza error si es inválido o expiró
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    // Busca el usuario y lo adjunta a la petición
    const usuario = await User.findById(decodificado.id);
    if (!usuario) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "El usuario de este token ya no existe",
      });
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      exitoso: false,
      mensaje: "Token inválido o expirado",
    });
  }
};

// Middleware: autoriza solo ciertos roles
exports.autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    // req.usuario existe porque 'proteger' corrió antes
    if (!req.usuario || !req.usuario.rol) {
      return res.status(403).json({
        exitoso: false,
        mensaje: "No se encontró un rol asignado al usuario",
      });
    }

    // Normaliza el rol del usuario
    let rolUsuario = req.usuario.rol.toLowerCase().trim();

    // Unifica "usuario" como "paciente"
    if (rolUsuario === "usuario") {
      rolUsuario = "paciente";
    }

    // Normaliza los roles permitidos de la ruta
    const rolesNormalizados = rolesPermitidos.map((r) =>
      r.toLowerCase().trim(),
    );

    // Verifica si el rol está incluido
    if (!rolesNormalizados.includes(rolUsuario)) {
      return res.status(403).json({
        exitoso: false,
        mensaje: `El rol '${req.usuario.rol}' no tiene permiso para esta acción`,
      });
    }

    next();
  };
};
