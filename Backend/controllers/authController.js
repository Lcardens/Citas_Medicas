const User = require("../models/user");
const Paciente = require("../models/Paciente");
const Medico = require("../models/medico");
const Cita = require("../models/cita");
const jwt = require("jsonwebtoken");
const { registrarEvento } = require("./auditController");

// Genera el token JWT
const generarToken = (usuario) => {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

  return jwt.sign({ id: usuario._id, rol: usuario.rol }, secret, {
    expiresIn,
  });
};

// POST /api/auth/registro
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol, TipoDocumento, Documento, Telefono } =
      req.body;

    // Campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "Nombre, email y contraseña son obligatorios",
      });
    }

    // Validación de contraseña corta
    if (password.length < 6) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Comprobar si el email ya existe
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

    // Detecta si quien crea el usuario es un admin autenticado
    let solicitanteAdmin = false;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        if (decodificado && decodificado.id) {
          const solicitante = await User.findById(decodificado.id);
          const rolSolicitante = (solicitante?.rol || "")
            .toLowerCase()
            .trim();
          solicitanteAdmin = rolSolicitante === "admin" || rolSolicitante === "administrador";
        }
      } catch {
        solicitanteAdmin = false;
      }
    }

    if (rolNormalizado === "admin" || rolNormalizado === "administrador") {
      if (!solicitanteAdmin) {
        return res.status(403).json({
          exitoso: false,
          mensaje: "No puedes auto-registrarte como administrador",
        });
      }
    }

    // El médico debe existir previamente en el sistema
    if (rolNormalizado === "medico") {
      const { Registromedico } = req.body;
      if (!Registromedico || !Registromedico.trim()) {
        return res.status(400).json({
          exitoso: false,
          mensaje:
            "Debes ingresar tu registro médico para crear tu cuenta de médico",
        });
      }
      const medicoExistente = await Medico.findOne({
        Registromedico: Registromedico.trim(),
      });
      if (!medicoExistente) {
        return res.status(400).json({
          exitoso: false,
          mensaje:
            "Este registro médico no está registrado en el sistema. Pide a un administrador que te cree como médico primero.",
        });
      }
    }

    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: rolNormalizado,
    });

    await registrarEvento({
      req,
      usuario,
      accion: "registro",
      entidad: "auth",
      entidadId: usuario._id,
      detalles: { email, rol: rolNormalizado },
    });

    if (rolNormalizado === "paciente" || rolNormalizado === "usuario") {
      try {
        const pacienteExiste = await Paciente.findOne({ Correo: email });
        if (!pacienteExiste) {
          const nuevoPaciente = await Paciente.create({
            TipoDocumento: TipoDocumento || "CC",
            Documento: Documento || email,
            Nombre: nombre,
            Correo: email,
            Telefono: Telefono || "Sin registro",
          });
          console.log(
            "Paciente creado desde registro:",
            nuevoPaciente._id,
            email,
          );
        }
      } catch (errPaciente) {
        console.error("Error al crear Paciente:", errPaciente.message);
      }
    }

    if (rolNormalizado === "medico") {
      try {
        const { Registromedico } = req.body;
        const medicoExistente = await Medico.findOne({
          Registromedico: Registromedico.trim(),
        });
        if (medicoExistente) {
          // Vincula el médico existente con el usuario
          await Medico.updateOne(
            { _id: medicoExistente._id },
            { $set: { email, Nombre: nombre } },
          ).exec();
        }
      } catch (errMedico) {
        console.error("Error al vincular Medico:", errMedico.message);
      }
    }

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

// POST /api/auth/login
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
      await registrarEvento({
        req,
        usuario: null,
        email,
        accion: "login_fallido",
        entidad: "auth",
        detalles: { motivo: "usuario_no_encontrado", email },
      });
      return res.status(401).json({
        exitoso: false,
        mensaje: "Credenciales inválidas",
      });
    }

    const esPasswordCorrecta = await usuario.compararPassword(password);
    if (!esPasswordCorrecta) {
      await registrarEvento({
        req,
        usuario,
        accion: "login_fallido",
        entidad: "auth",
        detalles: { motivo: "password_incorrecta", email },
      });
      return res.status(401).json({
        exitoso: false,
        mensaje: "Credenciales inválidas",
      });
    }

    const token = generarToken(usuario);

    await registrarEvento({
      req,
      usuario,
      accion: "login",
      entidad: "auth",
      detalles: { email },
    });

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

// GET /api/auth/usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select("-password");

    // Respuesta estándar
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

// DELETE /api/auth/usuarios/:id
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir borrarse a sí mismo
    if (String(req.usuario._id) === String(id)) {
      return res.status(400).json({
        exitoso: false,
        mensaje: "No puedes eliminar tu propia cuenta desde aquí.",
      });
    }

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({
        exitoso: false,
        mensaje: "Usuario no encontrado",
      });
    }

    const correo = usuario.email;
    const rol = usuario.rol.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let pacienteId = null;
    let medicoId = null;

    if (rol === "paciente" || rol === "usuario") {
      const paciente = await Paciente.findOne({ Correo: correo });
      if (paciente) {
        pacienteId = paciente._id;
        await Paciente.findByIdAndDelete(paciente._id);
      }
    } else if (rol === "medico" || rol === "admin" || rol === "administrador") {
      const medico = await Medico.findOne({ email: correo });
      if (medico) {
        medicoId = medico._id;
        await Medico.findByIdAndDelete(medico._id);
      }
    }

    // Eliminar citas asociadas
    if (pacienteId) {
      await Cita.deleteMany({ paciente: pacienteId });
    }
    if (medicoId) {
      await Cita.deleteMany({ medico: medicoId });
    }

    await User.findByIdAndDelete(id);

    await registrarEvento({
      req,
      usuario: req.usuario,
      accion: "eliminar_usuario",
      entidad: "usuario",
      entidadId: id,
      detalles: { email: correo, rol },
    });

    res.status(200).json({
      exitoso: true,
      mensaje:
        "Usuario y sus datos asociados (perfil y citas) eliminados exitosamente",
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};

// GET /api/auth/me
exports.obtenerMiPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id).select("-password");

    // Datos complementarios según el rol
    let detalle = {};
    const rol = (usuario.rol || "").toLowerCase().trim();

    if (rol === "paciente" || rol === "usuario") {
      const paciente = await Paciente.findOne({ Correo: usuario.email });
      if (paciente) {
        detalle = {
          tipoDocumento: paciente.TipoDocumento,
          documento: paciente.Documento,
          telefono: paciente.Telefono,
          pacienteId: paciente._id,
        };
      }
    } else if (rol === "medico") {
      const medico = await Medico.findOne({ email: usuario.email });
      if (medico) {
        detalle = {
          registroMedico: medico.Registromedico,
          medicoId: medico._id,
        };
      }
    } else if (rol === "admin" || rol === "administrador") {
      const medico = await Medico.findOne({ email: usuario.email });
      if (medico) {
        detalle = { registroMedico: medico.Registromedico, medicoId: medico._id };
      }
    }

    res.status(200).json({
      exitoso: true,
      datos: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ...detalle,
      },
    });
  } catch (error) {
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al obtener el perfil",
      error: error.message,
    });
  }
};

// PUT /api/auth/perfil
exports.actualizarMiPerfil = async (req, res) => {
  try {
    const { nombre, password, passwordActual, telefono } = req.body;
    const usuario = req.usuario;

    // Actualizar nombre si se envía
    if (nombre && nombre.trim()) {
      usuario.nombre = nombre.trim();
    }

    // Actualizar contraseña si se envía
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          exitoso: false,
          mensaje: "La nueva contraseña debe tener al menos 6 caracteres",
        });
      }

// Exige la contraseña actual antes de cambiarla
      if (!passwordActual) {
        return res.status(400).json({
          exitoso: false,
          mensaje: "Debes ingresar tu contraseña actual para cambiarla",
        });
      }

      const usuarioConPassword = await User.findById(usuario._id).select(
        "+password",
      );
      const esValida = await usuarioConPassword.compararPassword(passwordActual);
      if (!esValida) {
        return res.status(400).json({
          exitoso: false,
          mensaje: "La contraseña actual no es correcta",
        });
      }

      usuario.set("password", password); // el hook pre('save') la cifra automáticamente
    }

    await usuario.save();

    // Sincroniza nombre/telefono en el registro vinculado
    const rol = (usuario.rol || "").toLowerCase().trim();
    if (nombre && nombre.trim()) {
      if (rol === "paciente" || rol === "usuario") {
        await Paciente.updateOne(
          { Correo: usuario.email },
          { $set: { Nombre: nombre.trim() } },
        ).exec();
      } else if (rol === "medico" || rol === "admin" || rol === "administrador") {
        await Medico.updateOne(
          { email: usuario.email },
          { $set: { Nombre: nombre.trim() } },
        ).exec();
      }

      await registrarEvento({
        req,
        usuario,
        accion: "actualizar_perfil",
        entidad: "perfil",
        entidadId: usuario._id,
        detalles: { campos: Object.keys(req.body) },
      });
    }

    if (telefono && (rol === "paciente" || rol === "usuario")) {
      await Paciente.updateOne(
        { Correo: usuario.email },
        { $set: { Telefono: telefono.trim() } },
      ).exec();
    }

    res.status(200).json({
      exitoso: true,
      mensaje: "Perfil actualizado correctamente",
      datos: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({
      exitoso: false,
      mensaje: "Error al actualizar el perfil",
      error: error.message,
    });
  }
};
