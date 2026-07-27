const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware: proteger rutas (verifica el token)
exports.proteger = async (req, res, next) => {
  try {
    let token;

    // 1. Buscar el token en el header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // El header viene como: "Bearer eyJhbGc..."
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Si no hay token, denegar acceso
    if (!token) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "No autorizado, no hay token",
      });
    }

    // 3. Verificar el token (lanza error si firma inválida o expiró)
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar el usuario y adjuntarlo a la petición
    const usuario = await User.findById(decodificado.id);
    if (!usuario) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "El usuario de este token ya no existe",
      });
    }

    // 5. Guardar el usuario en req para los siguientes pasos
    req.usuario = usuario;

    // 6. Dejar pasar al controlador
    next();
  } catch (error) {
    return res.status(401).json({
      exitoso: false,
      mensaje: "Token inválido o expirado",
    });
  }
};

// Middleware: autorizar solo ciertos roles (Flexible y normalizado)
exports.autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    // req.usuario ya existe porque 'proteger' corrió antes
    if (!req.usuario || !req.usuario.rol) {
      return res.status(403).json({
        exitoso: false,
        mensaje: "No se encontró un rol asignado al usuario",
      });
    }

    // 1. Normalizar el rol del usuario (minúsculas y sin espacios)
    let rolUsuario = req.usuario.rol.toLowerCase().trim();

    // 2. Unificar "usuario" como "paciente" por compatibilidad
    if (rolUsuario === "usuario") {
      rolUsuario = "paciente";
    }

    // 3. Normalizar los roles permitidos que vienen en la ruta
    const rolesNormalizados = rolesPermitidos.map((r) =>
      r.toLowerCase().trim(),
    );

    // 4. Verificar si el rol normalizado está incluido
    if (!rolesNormalizados.includes(rolUsuario)) {
      return res.status(403).json({
        exitoso: false,
        mensaje: `El rol '${req.usuario.rol}' no tiene permiso para esta acción`,
      });
    }

    next();
  };
};
