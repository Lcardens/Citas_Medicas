const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true },
    accion: {
      type: String,
      required: true,
      enum: [
        "crear_cita",
        "actualizar_cita",
        "eliminar_cita",
        "asignar_cita",
        "crear_usuario",
        "eliminar_usuario",
        "login",
        "login_fallido",
        "registro",
        "actualizar_perfil",
      ],
    },
    entidad: {
      type: String,
      enum: ["cita", "usuario", "perfil", "auth"],
      required: true,
    },
    entidadId: { type: String, default: null },
    detalles: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "desconocida" },
  },
  { timestamps: true }
);

auditLogSchema.index({ fecha: -1 });
auditLogSchema.index({ usuario: 1 });
auditLogSchema.index({ accion: 1 });

module.exports =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
