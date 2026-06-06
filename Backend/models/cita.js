const mongoose = require("mongoose");

const citaSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: false,
    },

    medico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medico",
      required: true,
    },

    fecha: {
      type: Date,
      required: true,
    },

    motivo: {
      type: String,
      required: true,
      trim: true,
    },

    estado: {
      type: String,
      enum: ["Pendiente", "Confirmada", "Cancelada", "Completada"],
      default: "Pendiente",
    },

    observaciones: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Cita", citaSchema);
