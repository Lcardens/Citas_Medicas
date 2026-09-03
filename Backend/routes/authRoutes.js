const express = require("express");
const router = express.Router();

const { proteger, autorizar } = require("../middleware/auth");

const {
  registrar,
  login,
  obtenerUsuarios,
  obtenerMiPerfil,
  actualizarMiPerfil,
  eliminarUsuario,
} = require("../controllers/authController");

router.post("/registro", registrar);
router.post("/login", login);

router.get("/me", proteger, obtenerMiPerfil);
router.put("/perfil", proteger, actualizarMiPerfil);

router.get(
  "/usuarios",
  proteger,
  autorizar("admin", "administrador"),
  obtenerUsuarios,
);

router.delete(
  "/usuarios/:id",
  proteger,
  autorizar("admin", "administrador"),
  eliminarUsuario,
);

module.exports = router;
