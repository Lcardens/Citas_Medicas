const mongoose = require("mongoose");

const pacienteSchema = new mongoose.Schema(
  {
    TipoDocumento: {
      type: String,
      enum: ["CC", "TI", "CE", "Pasaporte"],
      required: true,
    },
    Documento: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    Nombre: {
      type: String,
      required: true,
      trim: true,
    },

    Correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    Telefono: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Paciente", pacienteSchema);
