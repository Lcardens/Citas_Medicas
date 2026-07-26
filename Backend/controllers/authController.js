const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Función auxiliar para generar el Token JWT
const generarToken = (usuario) => {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

  return jwt.sign({ id: usuario._id, rol: usuario.rol }, secret, {
    expiresIn,
  });
};

// 1. POST /api/auth/registro
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Nombre, email y contraseña son obligatorios",
      });
    }

    // Comprobar si el email ya existe
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Este correo ya está registrado",
      });
    }

    // Crear el usuario (el rol por defecto será "usuario" si no se envía "admin")
    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: rol || "usuario",
    });

    // Generar token JWT
    const token = generarToken(usuario);

    // Responder con token y datos básicos del usuario
    res.status(201).json({
      exitoso: true,
      mensaje: "Usuario registrado con éxito",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al registrar el usuario",
      error: error.message,
    });
  }
};

// 2. POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Por favor ingresa un email y contraseña",
      });
    }

    // Buscar al usuario e incluir la contraseña cifrada para comparar
    const usuario = await User.findOne({ email }).select("+password");
    if (!usuario) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "Credenciales inválidas",
      });
    }

    // Comparar la contraseña enviada con la de la BD
    const esPasswordCorrecta = await usuario.compararPassword(password);
    if (!esPasswordCorrecta) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "Credenciales inválidas",
      });
    }

    // Generar token JWT
    const token = generarToken(usuario);

    // Responder con token y datos del usuario que inicia sesión
    res.status(200).json({
      exitoso: true,
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol, // Aquí viaja si es 'admin' o 'usuario'
      },
    });
  } catch (error) {
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
};
