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

    // 1. Campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Nombre, email y contraseña son obligatorios",
      });
    }

    // 2. Validación de contraseña corta
    if (password.length < 6) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // 3. Comprobar si el email ya existe
    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Este correo electrónico ya está registrado",
      });
    }

    let rolNormalizado = (rol || "usuario")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: rolNormalizado,
    });

    const token = generarToken(usuario);

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
      mensaje: error.message || "Error al registrar el usuario",
    });
  }
};

// 2. POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Por favor ingresa un email y contraseña",
      });
    }

    const usuario = await User.findOne({ email }).select("+password");
    if (!usuario) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "Credenciales inválidas",
      });
    }

    const esPasswordCorrecta = await usuario.compararPassword(password);
    if (!esPasswordCorrecta) {
      return res.status(401).json({
        exitoso: false,
        mensaje: "Credenciales inválidas",
      });
    }

    const token = generarToken(usuario);

    res.status(200).json({
      exitoso: true,
      mensaje: "Inicio de sesión exitoso",
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
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

// 3. GET /api/auth/usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select("-password");

    // Responder con estructura estandarizada
    res.status(200).json({
      exitoso: true,
      datos: usuarios,
    });
  } catch (error) {
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al obtener la lista de usuarios",
      error: error.message,
    });
  }
};
