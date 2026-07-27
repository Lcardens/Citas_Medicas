const express = require("express");
const router = express.Router();

// 🟢 1. Importa el middleware global correcto
const { proteger, autorizar } = require("../middleware/auth");

const {
  registrar,
  login,
  obtenerUsuarios,
} = require("../controllers/authController");

router.post("/registro", registrar);
router.post("/login", login);

// 🟢 2. Aplica 'proteger' y exige estrictamente rol de administrador
router.get(
  "/usuarios",
  proteger,
  autorizar("admin", "administrador"),
  obtenerUsuarios,
);

module.exports = router;
