const mongoose = require("mongoose");

const medicoSchema = new mongoose.Schema(
  {
    Registromedico: {
      type: String,
      required: true,
    },

    Nombre: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Medico", medicoSchema);
