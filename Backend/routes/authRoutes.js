const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const {
  registrar,
  login,
  obtenerUsuarios,
} = require("../controllers/authController");

// 🟢 Definir el middleware directamente
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      exitoso: false,
      mensaje: "Acceso denegado. No se proporcionó un token.",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    const decodificado = jwt.verify(token, secret);
    req.usuario = decodificado;
    next();
  } catch (error) {
    return res.status(403).json({
      exitoso: false,
      mensaje: "Token inválido o expirado.",
    });
  }
};

router.post("/registro", registrar);
router.post("/login", login);
router.get("/usuarios", verificarToken, obtenerUsuarios);

module.exports = router;
