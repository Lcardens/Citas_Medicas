import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { PacienteService } from '../../core/services/paciente.service';
import { DialogService } from '../../core/services/dialog.service';
import { BuscadorPacienteComponent } from '../../shared/buscador-paciente/buscador-paciente.component';

@Component({
  selector: 'app-misturnos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, BuscadorPacienteComponent],
  templateUrl: './misturnos.html',
  styleUrls: ['./misturnos.css'],
})
export class MisturnosComponent implements OnInit {
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  citas: any[] = [];
  cargando = true;
  medicoId: string = '';
  mensaje = '';
  error = '';

  busqueda = '';
  paginaActual = 1;
  elementosPorPagina = 10;

  citaEditando: any = {
    _id: '',
    diagnostico: '',
    notasConsulta: '',
  };
  mostrarModal = false;
  mostrarModalAsignar = false;
  guardando = false;

  pacientes: any[] = [];
  motivosCita: string[] = [
    'Control médico general',
    'Consulta por síntomas',
    'Revisión / seguimiento',
    'Exámenes de laboratorio',
    'Vacunación',
    'Autorización médica',
    'Cita de urgencia',
    'Otro',
  ];
  nuevaCita: any = {
    paciente: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: '',
    motivoOtro: '',
  };
  horasDisponibles: string[] = [];
  horariosAtencion: string[] = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];
  cargandoHoras = false;
  minFecha = new Date().toISOString().split('T')[0];

  mostrarHistorial = false;
  cargandoHistorial = false;
  pacienteHistorial: any = null;
  historialCitas: any[] = [];

  ngOnInit(): void {
    this.cargarAgenda();
  }

  get citasFiltradas(): any[] {
    let lista = this.citas;
    if (this.busqueda.trim()) {
      const q = this.busqueda.trim().toLowerCase();
      lista = lista.filter((c) => {
        const paciente = (this.nombrePaciente(c) || '').toLowerCase();
        const motivo = (c.motivo || '').toLowerCase();
        const estado = (c.estado || '').toLowerCase();
        const fecha = String(c.fecha || '').toLowerCase();
        const hora = (c.hora || '').toLowerCase();
        return paciente.includes(q) || motivo.includes(q) || estado.includes(q) ||
          fecha.includes(q) || hora.includes(q);
      });
    }
    return lista;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.citasFiltradas.length / this.elementosPorPagina));
  }

  get citasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.citasFiltradas.slice(inicio, inicio + this.elementosPorPagina);
  }

  get inicioRegistro(): number {
    return this.citasFiltradas.length === 0 ? 0 : (this.paginaActual - 1) * this.elementosPorPagina + 1;
  }

  get finRegistro(): number {
    return Math.min(this.paginaActual * this.elementosPorPagina, this.citasFiltradas.length);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.citaService.obtenerAgendaMedico().subscribe({
      next: (res: any) => {
        const datos = res?.datos || [];
        this.citas = datos.slice().sort((a: any, b: any) => {
          const difFecha = String(a.fecha || '').localeCompare(String(b.fecha || ''));
          if (difFecha !== 0) return difFecha;
          return this.horaAMinutos(a.hora || '') - this.horaAMinutos(b.hora || '');
        });
        this.medicoId = res?.medicoId || '';
        if (res?.mensaje && this.citas.length === 0) {
          this.mensaje = res.mensaje;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la agenda:', err);
        this.error = err?.error?.mensaje || 'No se pudo cargar tu agenda.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModalAsignar(): void {
    this.nuevaCita = {
      paciente: '',
      medico: this.medicoId,
      fecha: '',
      hora: '',
      motivo: '',
      motivoOtro: '',
    };
    this.horasDisponibles = [];
    this.mostrarModalAsignar = true;

    if (this.pacientes.length === 0) {
      this.pacienteService.obtenerPacientes().subscribe({
        next: (res: any) => {
          const data = res?.datos || res || [];
          this.pacientes = data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.pacientes = [];
          this.cdr.detectChanges();
        },
      });
    }
  }

  cerrarModalAsignar(): void {
    this.mostrarModalAsignar = false;
    this.horasDisponibles = [];
  }

  cambioFechaAsignar(): void {
    this.nuevaCita.hora = '';
    this.horasDisponibles = [];
    if (!this.nuevaCita.fecha) return;

    this.cargandoHoras = true;
    this.citaService
      .obtenerHorasDisponibles(this.medicoId, this.nuevaCita.fecha)
      .subscribe({
        next: (res: any) => {
          const horasDevueltas: string[] = res?.horas || [];
          let horasOrdenadas = this.horariosAtencion.filter((h) =>
            horasDevueltas.includes(h),
          );
          if (this.nuevaCita.fecha === this.minFecha) {
            const ahora = new Date();
            const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
            horasOrdenadas = horasOrdenadas.filter((h) => {
              return this.horaAMinutos(h) > minutosActuales;
            });
          }
          this.horasDisponibles = horasOrdenadas;
          this.cargandoHoras = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.horasDisponibles = [];
          this.cargandoHoras = false;
          this.cdr.detectChanges();
        },
      });
  }

  guardarCitaAsignada(): void {
    if (!this.nuevaCita.paciente || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      this.dialogService.confirmar({
        titulo: 'Datos incompletos',
        mensaje: 'Selecciona un paciente, una fecha y una hora.',
        textoConfirmar: 'Entendido',
        textoCancelar: '',
        tipo: 'advertencia',
      });
      return;
    }

    const payload = {
      paciente: this.nuevaCita.paciente,
      medico: this.medicoId,
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora,
      motivo:
        this.nuevaCita.motivo === 'Otro'
          ? (this.nuevaCita.motivoOtro || '').trim()
          : this.nuevaCita.motivo,
    };

    this.guardando = true;
    this.citaService.crearCita(payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        this.cerrarModalAsignar();

        const datos = res.datos || {};
        const fecha = datos.fecha || this.nuevaCita.fecha || '';
        const hora = datos.hora || this.nuevaCita.hora || '';
        const pacienteN =
          datos.paciente?.Nombre ||
          datos.paciente?.nombre ||
          this.nombrePaciente({ paciente: this.nuevaCita.paciente }) ||
          'el paciente';

        let mensaje = `Cita asignada con éxito a ${pacienteN}`;
        if (fecha) mensaje += ` para el día ${fecha}`;
        if (hora) mensaje += ` a las ${hora}`;
        mensaje += '.';

        this.dialogService.confirmar({
          titulo: 'Cita asignada',
          mensaje,
          textoConfirmar: 'Aceptar',
          textoCancelar: '',
          tipo: 'info',
        });

        this.cargarAgenda();
      },
      error: (err) => {
        this.guardando = false;
        const detalle = err?.error?.mensaje || 'No se pudo asignar la cita.';
        this.dialogService.confirmar({
          titulo: 'Error',
          mensaje: detalle,
          textoConfirmar: 'Entendido',
          textoCancelar: '',
          tipo: 'peligro',
        });
      },
    });
  }

  abrirModalAtender(cita: any): void {
    this.citaEditando = {
      _id: cita._id,
      diagnostico: cita.diagnostico || '',
      notasConsulta: cita.notasConsulta || '',
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaEditando = { _id: '', diagnostico: '', notasConsulta: '' };
  }

  marcarAtendida(): void {
    if (!this.citaEditando._id) return;

    const payload: any = { estado: 'Atendida' };
    if (this.citaEditando.diagnostico && this.citaEditando.diagnostico.trim()) {
      payload.diagnostico = this.citaEditando.diagnostico.trim();
    }
    if (this.citaEditando.notasConsulta && this.citaEditando.notasConsulta.trim()) {
      payload.notasConsulta = this.citaEditando.notasConsulta.trim();
    }

    this.guardando = true;
    this.citaService.actualizarCita(this.citaEditando._id, payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Cita marcada como atendida.';
        this.cerrarModal();
        this.cargarAgenda();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.mensaje || 'No se pudo actualizar la cita.';
        this.cdr.detectChanges();
      },
    });
  }

  nombrePaciente(cita: any): string {
    const p = cita?.paciente;
    if (typeof p === 'string') return 'ID: ' + p;
    return (
      p?.Nombre ||
      p?.nombre ||
      p?.nombres ||
      p?.nombreCompleto ||
      'Paciente'
    );
  }

  idPaciente(cita: any): string {
    const p = cita?.paciente;
    if (!p) return '';
    return typeof p === 'string' ? p : p?._id || p?.id || '';
  }

  abrirHistorial(cita: any): void {
    const id = this.idPaciente(cita);
    if (!id) return;

    this.pacienteHistorial = {
      Nombre: this.nombrePaciente(cita),
    };
    this.historialCitas = [];
    this.mostrarHistorial = true;
    this.cargandoHistorial = true;
    this.cdr.detectChanges();

    this.citaService.obtenerHistorialClinico(id).subscribe({
      next: (res: any) => {
        this.historialCitas = res?.datos || [];
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historialCitas = [];
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
    });
  }

  cerrarHistorial(): void {
    this.mostrarHistorial = false;
    this.pacienteHistorial = null;
    this.historialCitas = [];
  }

  nombreMedicoHistorial(cita: any): string {
    const m = cita?.medico;
    if (!m) return '—';
    if (typeof m === 'string') return 'ID: ' + m;
    return m.Nombre || m.nombre || m.nombres || m.nombreCompleto || 'Médico';
  }

  formatearFechaHistorial(fecha: string): string {
    const partes = String(fecha || '').split('-');
    if (partes.length !== 3) return fecha;
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }

  horaAMinutos(hora: string): number {
    const match = hora.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    const periodo = match[3].toUpperCase();
    if (periodo === 'PM' && horas !== 12) horas += 12;
    if (periodo === 'AM' && horas === 12) horas = 0;
    return horas * 60 + minutos;
  }
}
