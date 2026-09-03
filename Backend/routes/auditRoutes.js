const express = require("express");
const router = express.Router();
const { proteger, autorizar } = require("../middleware/auth");
const { listarLogs } = require("../controllers/auditController");

router.get(
  "/",
  proteger,
  autorizar("admin", "administrador"),
  listarLogs
);

module.exports = router;
