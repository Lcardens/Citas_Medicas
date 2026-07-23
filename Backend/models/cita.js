const mongoose = require("mongoose");

const citaSchema = new mongoose.Schema(
  {
    medico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medico",
      required: true,
    },
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fecha: {
      type: String,
      required: true,
    },
    motivo: {
      type: String,
      default: "Consulta Médica",
    },
    estado: {
      type: String,
      enum: ["Disponible", "Confirmada", "Cancelada"],
      default: "Disponible",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Cita || mongoose.model("Cita", citaSchema);
