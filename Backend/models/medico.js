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

    diasAtencion: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },

    horasAtencion: {
      type: [String],
      default: [
        "08:00 AM",
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
        "06:00 PM",
      ],
    },

    diasBloqueados: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Medico", medicoSchema);
