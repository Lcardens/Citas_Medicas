const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email inválido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    rol: {
      type: String,
      enum: ["usuario", "admin", "medico", "paciente"],
      default: "usuario",
    },
  },
  { timestamps: true },
);

// HOOK: Cifrar contraseña antes de guardar (Sin 'next' porque es async)
userSchema.pre("save", async function () {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified("password")) {
    return; // ← Cambiado 'return next()' por solo 'return'
  }

  // Generar el salt y hashear
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // ← Eliminado el 'next()' del final
});

// MÉTODO: comparar contraseña en el login
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
