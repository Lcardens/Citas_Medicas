const Cita = require("../models/cita");
const Paciente = require("../models/Paciente");

// Reporte: conteo de citas por estado
exports.citasPorEstado = async (req, res) => {
  try {
    const citas = await Cita.find({}, { estado: 1, fecha: 1 });

    const estados = { Disponible: 0, Confirmada: 0, Atendida: 0, Cancelada: 0 };
    const porMes = {};

    for (const cita of citas) {
      const estado = cita.estado || "Disponible";
      if (estados[estado] !== undefined) {
        estados[estado]++;
      } else {
        estados[estado] = 1;
      }

      const mes = (cita.fecha || "").slice(0, 7);
      if (mes) {
        if (!porMes[mes]) porMes[mes] = { mes, Disponible: 0, Confirmada: 0, Atendida: 0, Cancelada: 0 };
        if (porMes[mes][estado] !== undefined) {
          porMes[mes][estado]++;
        }
      }
    }

    const historial = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes));

    res.status(200).json({
      exitoso: true,
      datos: { estados, total: citas.length, historial },
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener estados de citas",
      error: error.message,
    });
  }
};

// Reporte: citas confirmadas/atendidas por mes
exports.citasPorMes = async (req, res) => {
  try {
    const citas = await Cita.find({
      estado: { $in: ["Confirmada", "Atendida"] },
    });

    const porMes = {};

    for (const cita of citas) {
      const mes = (cita.fecha || "").slice(0, 7); // YYYY-MM
      if (!mes) continue;
      if (!porMes[mes]) {
        porMes[mes] = { mes, total: 0 };
      }
      porMes[mes].total += 1;
    }

    const datos = Object.values(porMes).sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );

    res.status(200).json({
      exitoso: true,
      mensaje: "Citas por mes obtenidas exitosamente",
      datos,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener citas por mes",
      error: error.message,
    });
  }
};

// Reporte: pacientes con más citas confirmadas/atendidas
exports.pacientesFrecuentes = async (req, res) => {
  try {
    const citas = await Cita.find({
      estado: { $in: ["Confirmada", "Atendida"] },
      paciente: { $ne: null },
    }).populate(
      "paciente",
      "Nombre nombre nombres nombreCompleto documento Documento Correo email",
    );

    const conteo = {};

    for (const cita of citas) {
      const p = cita.paciente;
      if (!p || typeof p !== "object") continue;
      const id = String(p._id);
      if (!conteo[id]) {
        conteo[id] = {
          pacienteId: id,
          nombre:
            p.Nombre || p.nombre || p.nombres || p.nombreCompleto || "Paciente",
          documento: p.Documento || p.documento || "—",
          citas: 0,
        };
      }
      conteo[id].citas += 1;
    }

    const datos = Object.values(conteo).sort((a, b) => b.citas - a.citas);

    res.status(200).json({
      exitoso: true,
      mensaje: "Pacientes frecuentes obtenidos exitosamente",
      datos,
    });
  } catch (error) {
    res.status(400).json({
      exitoso: false,
      mensaje: "Error al obtener pacientes frecuentes",
      error: error.message,
    });
  }
};
