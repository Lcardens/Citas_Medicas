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

    // Apellido: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

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

    // Direccion: {
    //   type: String,
    //   trim: true,
    // },

    // Genero: {
    //   type: String,
    //   enum: ["Masculino", "Femenino", "Otro"],
    // },

    // FechaNacimiento: {
    //   type: Date,
    // },

    // TipoSangre: {
    //   type: String,
    //   enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    // },

    // Alergias: [{ type: String }],

    // Enfermedades: [
    //   {
    //     type: String,
    //   },
    // ],

    // ContactoEmergencia: {
    //   nombre: String,
    //   telefono: String,
    //   parentesco: String,
    // },

    // EPS: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    // TipoAfiliacion: {
    //   type: String,
    //   enum: ["Contributivo", "Subsidiado", "Particular"],
    // },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Paciente", pacienteSchema);
