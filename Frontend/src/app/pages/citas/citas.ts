import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CitaService } from '../../core/services/cita.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';
import { rolDesdeToken, normalizarRol } from '../../core/utils/auth.util';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css'],
})
export class CitasComponent implements OnInit {
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  citas: any[] = [];
  pacientes: any[] = [];
  medicos: any[] = [];
  cargando = true;
  mostrarModal = false;
  mostrarModalEditar = false;

  busqueda = '';
  paginaActual = 1;
  elementosPorPagina = 10;

  horariosAtencion: string[] = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
  ];
  horasDisponibles: string[] = [];
  cargandoHoras = false;
  fechaSinDisponibilidad = false;

  rolUsuario: string = '';
  usuarioId: string = '';
  medicoId: string = '';
  medicoFiltro: string = '';
  pacienteFiltro: string = '';
  estadoFiltro: string = '';
  fechaFiltro: string = '';

  mesCalendario: Date = new Date();
  diasCalendario: any[] = [];
  nombresDias: string[] = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  disponibilidadMapa: { [fecha: string]: boolean } = {};
  cargandoDisponibilidad: boolean = false;
  fechaSeleccionada: string = '';

  nuevaCita = {
    paciente: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: '',
  };

  citaEditando: any = {
    _id: '',
    motivo: '',
    estado: 'Disponible',
    fecha: '',
    hora: '',
    paciente: '',
    medico: '',
  };

  get minFecha(): string {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${ahora.getFullYear()}-${mes}-${dia}`;
  }

  private get horaActualEnMinutos(): number {
    const ahora = new Date();
    return ahora.getHours() * 60 + ahora.getMinutes();
  }

  private horaAMinutos(hora: string): number {
    const match = hora.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    const periodo = match[3].toUpperCase();
    if (periodo === 'PM' && horas !== 12) horas += 12;
    if (periodo === 'AM' && horas === 12) horas = 0;
    return horas * 60 + minutos;
  }

  ngOnInit(): void {
    this.rolUsuario = normalizarRol(
      rolDesdeToken() || localStorage.getItem('rol') || 'paciente',
    );
    if (this.rolUsuario === 'usuario') {
      this.rolUsuario = 'paciente';
    }

    const datosUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioId = localStorage.getItem('usuarioId') || datosUsuario._id || datosUsuario.id || '';

    this.cargarDatosGlobales();
  }

  get esAdmin(): boolean {
    return this.rolUsuario === 'admin' || this.rolUsuario === 'administrador';
  }

  get esPersonalMedico(): boolean {
    return this.esAdmin || this.rolUsuario === 'medico' || this.rolUsuario === 'médico';
  }

  get mostrarColumnaAcciones(): boolean {
    return this.esPersonalMedico || this.rolUsuario === 'paciente';
  }

  get puedeAgendar(): boolean {
    return this.esAdmin || this.rolUsuario === 'medico' || this.rolUsuario === 'médico' || this.rolUsuario === 'paciente';
  }

  get citasFiltradas(): any[] {
    let lista = this.citas;

    if (this.rolUsuario === 'paciente') {
      const emailUsuario = localStorage.getItem('emailUsuario');
      lista = lista.filter((cita) => cita.paciente?.Correo === emailUsuario);
    }

    if (this.rolUsuario === 'medico' && this.medicoId) {
      lista = lista.filter((cita) => {
        const citaMedicoId = typeof cita.medico === 'object' ? cita.medico?._id : cita.medico;
        return String(citaMedicoId) === String(this.medicoId);
      });
    }

    if (this.medicoFiltro) {
      lista = lista.filter((cita) => {
        const medicoId = cita.medico?._id || cita.medico;
        return medicoId === this.medicoFiltro;
      });
    }

    if (this.pacienteFiltro) {
      lista = lista.filter((cita) => {
        const pacienteId = cita.paciente?._id || cita.paciente;
        return String(pacienteId) === String(this.pacienteFiltro);
      });
    }

    if (this.estadoFiltro) {
      lista = lista.filter(
        (cita) => (cita.estado || 'Disponible').toLowerCase() === this.estadoFiltro.toLowerCase(),
      );
    }

    if (this.fechaFiltro) {
      const valor = String(this.fechaFiltro).trim();
      lista = lista.filter((cita) => {
        const fechaCita = String(cita.fecha || '').slice(0, 10);
        const filtro = valor.slice(0, 10);
        return fechaCita === filtro ||
          (cita.fecha && String(cita.fecha).includes(valor));
      });
    }

    if (this.busqueda.trim()) {
      const q = this.busqueda.trim().toLowerCase();
      lista = lista.filter((cita) => {
        const paciente = (
          cita.paciente?.Nombre ||
          cita.paciente?.nombre ||
          cita.paciente?.nombres ||
          (typeof cita.paciente === 'string' ? cita.paciente : '') ||
          ''
        ).toLowerCase();
        const medico = (
          cita.medico?.Nombre ||
          cita.medico?.nombre ||
          cita.medico?.nombres ||
          (typeof cita.medico === 'string' ? cita.medico : '') ||
          ''
        ).toLowerCase();
        const motivo = (cita.motivo || '').toLowerCase();
        const estado = (cita.estado || '').toLowerCase();
        const fecha = String(cita.fecha || '').toLowerCase();
        const hora = (cita.hora || '').toLowerCase();
        return (
          paciente.includes(q) ||
          medico.includes(q) ||
          motivo.includes(q) ||
          estado.includes(q) ||
          fecha.includes(q) ||
          hora.includes(q)
        );
      });
    }

    return lista.slice().sort((a, b) => {
      const difFecha = String(a.fecha || '').localeCompare(String(b.fecha || ''));
      if (difFecha !== 0) return difFecha;
      return this.horaAMinutos(a.hora || '') - this.horaAMinutos(b.hora || '');
    });
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

  get puedeFiltrarPorPaciente(): boolean {
    return this.esAdmin;
  }

  limpiarFiltros(): void {
    this.medicoFiltro = '';
    this.pacienteFiltro = '';
    this.estadoFiltro = '';
    this.fechaFiltro = '';
    this.busqueda = '';
    this.paginaActual = 1;
  }

  cargarDatosGlobales(): void {
    this.cargando = true;

    const obsPacientes = this.esPersonalMedico
      ? this.pacienteService.obtenerPacientes().pipe(catchError(() => of([])))
      : of([]);

    const obsMedicos = this.medicoService.obtenerMedicos().pipe(catchError(() => of([])));
    const obsCitas = this.citaService.obtenerCitas().pipe(catchError(() => of([])));

    forkJoin({
      pacientesRes: obsPacientes,
      medicosRes: obsMedicos,
      citasRes: obsCitas,
    }).subscribe({
      next: (res: any) => {
        const pData = res.pacientesRes;
        this.pacientes = pData?.datos || pData || [];

        const mData = res.medicosRes;
        this.medicos = mData?.datos || mData || [];

        const rawCitas = res.citasRes?.datos || res.citasRes || [];

        this.citas = rawCitas.map((cita: any) => {
          const idPacienteEval =
            typeof cita.paciente === 'object' && cita.paciente !== null
              ? cita.paciente._id || cita.paciente.id
              : cita.paciente;

          if (idPacienteEval && this.pacientes.length > 0) {
            const encontrado = this.pacientes.find((p) => String(p._id) === String(idPacienteEval));
            if (encontrado) {
              cita.paciente = encontrado;
            }
          }

          const idMedicoEval =
            typeof cita.medico === 'object' && cita.medico !== null
              ? cita.medico._id || cita.medico.id
              : cita.medico;

          if (idMedicoEval && this.medicos.length > 0) {
            const encontrado = this.medicos.find((m) => String(m._id) === String(idMedicoEval));
            if (encontrado) {
              cita.medico = encontrado;
            }
          }

          return cita;
        });

        if (this.rolUsuario === 'medico' && !this.medicoId) {
          const emailUsuario = localStorage.getItem('emailUsuario');
          const medicoEncontrado = this.medicos.find(
            (m: any) => m.email?.toLowerCase() === emailUsuario?.toLowerCase(),
          );
          if (medicoEncontrado) {
            this.medicoId = medicoEncontrado._id;
          }
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error crítico al cargar los datos de la vista:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.limpiarFormulario();
    this.horasDisponibles = [];
    this.fechaSinDisponibilidad = false;
    this.mesCalendario = new Date();
    this.fechaSeleccionada = '';
    if (this.rolUsuario === 'medico' && this.medicoId) {
      this.nuevaCita.medico = this.medicoId;
    }
    this.construirCalendario();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
    this.horasDisponibles = [];
    this.fechaSinDisponibilidad = false;
    this.fechaSeleccionada = '';
  }

  fechaAAAAMMDD(d: Date): string {
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  construirCalendario(): void {
    const anio = this.mesCalendario.getFullYear();
    const mes = this.mesCalendario.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    const diaInicioSemana = primerDia.getDay();
    const hoy = this.fechaAAAAMMDD(new Date());

    const dias: any[] = [];
    for (let i = 0; i < diaInicioSemana; i++) {
      dias.push({ vacio: true });
    }
    for (let d = 1; d <= ultimoDia; d++) {
      const fecha = this.fechaAAAAMMDD(new Date(anio, mes, d));
      dias.push({
        vacio: false,
        fecha,
        dia: d,
        esHoy: fecha === hoy,
        pasada: fecha < hoy,
        seleccionada: fecha === this.fechaSeleccionada,
        disponible: this.disponibilidadMapa[fecha] !== false,
      });
    }
    while (dias.length % 7 !== 0) {
      dias.push({ vacio: true });
    }
    this.diasCalendario = dias;
  }

  get etiquetaMes(): string {
    return this.mesCalendario.toLocaleDateString('es', {
      month: 'long',
      year: 'numeric',
    });
  }

  cambiarMes(offset: number): void {
    const m = new Date(this.mesCalendario);
    m.setMonth(m.getMonth() + offset);
    this.mesCalendario = m;
    this.construirCalendario();
    if (this.mostrarModalEditar && this.esAdmin) {
      this.cargarDisponibilidadMesEditar();
    } else {
      this.cargarDisponibilidadMes();
    }
  }

  seleccionarFecha(fecha: string): void {
    const dia = this.diasCalendario.find((d) => !d.vacio && d.fecha === fecha);
    if (!dia) return;
    if (dia.pasada || !dia.disponible) return;
    this.fechaSeleccionada = fecha;
    this.nuevaCita.fecha = fecha;
    this.construirCalendario();
    this.onDisponibilidadChange();
  }

  seleccionarFechaEditar(fecha: string): void {
    const dia = this.diasCalendario.find((d) => !d.vacio && d.fecha === fecha);
    if (!dia) return;
    if (dia.pasada || !dia.disponible) return;
    this.fechaSeleccionada = fecha;
    this.citaEditando.fecha = fecha;
    this.citaEditando.hora = '';
    this.construirCalendario();
    this.cargarHorasSinFiltroHoy();
  }

  cargarDisponibilidadMes(): void {
    if (!this.nuevaCita.medico) {
      this.disponibilidadMapa = {};
      this.construirCalendario();
      return;
    }
    this.cargandoDisponibilidad = true;
    const anio = this.mesCalendario.getFullYear();
    const mes = this.mesCalendario.getMonth();
    const inicio = this.fechaAAAAMMDD(new Date(anio, mes, 1));
    const fin = this.fechaAAAAMMDD(new Date(anio, mes + 1, 0));
    this.citaService
      .obtenerDisponibilidadRango(this.nuevaCita.medico, inicio, fin)
      .subscribe({
        next: (res: any) => {
          this.disponibilidadMapa = res?.disponibilidad || {};
          this.cargandoDisponibilidad = false;
          this.construirCalendario();
          this.cdr.detectChanges();
        },
        error: () => {
          this.disponibilidadMapa = {};
          this.cargandoDisponibilidad = false;
          this.construirCalendario();
          this.cdr.detectChanges();
        },
      });
  }

  esDiaSeleccionable(dia: any): boolean {
    return !!dia && !dia.vacio && !dia.pasada && dia.disponible;
  }

  onMedicoChange(): void {
    this.nuevaCita.hora = '';
    this.fechaSinDisponibilidad = false;
    this.horasDisponibles = [];
    this.fechaSeleccionada = '';
    if (!this.nuevaCita.medico) {
      this.disponibilidadMapa = {};
      this.construirCalendario();
      return;
    }
    this.cargarDisponibilidadMes();
  }

  onMedicoChangeEditar(): void {
    this.citaEditando.hora = '';
    this.fechaSeleccionada = '';
    this.horasDisponibles = [];
    if (!this.citaEditando.medico) {
      this.disponibilidadMapa = {};
      this.construirCalendario();
      return;
    }
    this.cargarDisponibilidadMesEditar();
  }

  cargarDisponibilidadMesEditar(): void {
    if (!this.citaEditando.medico) {
      this.disponibilidadMapa = {};
      this.construirCalendario();
      return;
    }
    this.cargandoDisponibilidad = true;
    const anio = this.mesCalendario.getFullYear();
    const mes = this.mesCalendario.getMonth();
    const inicio = this.fechaAAAAMMDD(new Date(anio, mes, 1));
    const fin = this.fechaAAAAMMDD(new Date(anio, mes + 1, 0));
    this.citaService
      .obtenerDisponibilidadRango(this.citaEditando.medico, inicio, fin)
      .subscribe({
        next: (res: any) => {
          this.disponibilidadMapa = res?.disponibilidad || {};
          this.cargandoDisponibilidad = false;
          this.construirCalendario();
          this.cdr.detectChanges();
        },
        error: () => {
          this.disponibilidadMapa = {};
          this.cargandoDisponibilidad = false;
          this.construirCalendario();
          this.cdr.detectChanges();
        },
      });
  }

  onDisponibilidadChange(): void {
    this.nuevaCita.hora = '';
    this.fechaSinDisponibilidad = false;
    this.horasDisponibles = [];

    if (!this.nuevaCita.medico || !this.nuevaCita.fecha) {
      return;
    }

    this.cargandoHoras = true;
    this.citaService
      .obtenerHorasDisponibles(this.nuevaCita.medico, this.nuevaCita.fecha)
      .subscribe({
        next: (res: any) => {
          const horasDevueltas: string[] = res?.horas || [];
          const esHoy = this.nuevaCita.fecha === this.minFecha;

          let horasOrdenadas = this.horariosAtencion.filter((h) =>
            horasDevueltas.includes(h),
          );

          if (esHoy) {
            const minutosActuales = this.horaActualEnMinutos;
            horasOrdenadas = horasOrdenadas.filter((h) => {
              return this.horaAMinutos(h) > minutosActuales;
            });
          }

          this.horasDisponibles = horasOrdenadas;
          if (this.horasDisponibles.length === 0) {
            this.fechaSinDisponibilidad = true;
          }
          this.cargandoHoras = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar horas disponibles:', err);
          this.horasDisponibles = [];
          this.fechaSinDisponibilidad = true;
          this.cargandoHoras = false;
          this.cdr.detectChanges();
        },
      });
  }

  guardarCita(): void {
    const datosEnviar: any = { ...this.nuevaCita };
    if (this.rolUsuario === 'paciente') {
      delete datosEnviar.paciente;
    }

    if (this.rolUsuario !== 'paciente' && !datosEnviar.paciente) {
      this.dialogService.confirmar({
        titulo: 'Datos incompletos',
        mensaje: 'Por favor seleccione un paciente.',
        textoConfirmar: 'Entendido',
        textoCancelar: '',
        tipo: 'advertencia',
      });
      return;
    }

    if (!datosEnviar.medico || !datosEnviar.fecha || !datosEnviar.hora) {
      this.dialogService.confirmar({
        titulo: 'Datos incompletos',
        mensaje: 'Por favor complete todos los campos obligatorios (médico, fecha, hora).',
        textoConfirmar: 'Entendido',
        textoCancelar: '',
        tipo: 'advertencia',
      });
      return;
    }

    this.citaService.crearCita(datosEnviar).subscribe({
      next: (res: any) => {
        this.cerrarModal();

        const datos = res.datos || {};
        const medicoNom =
          datos.medico?.Nombre ||
          datos.medico?.nombre ||
          datos.medico?.nombreCompleto ||
          'el médico seleccionado';
        const fecha = datos.fecha || this.nuevaCita.fecha || '';
        const hora = datos.hora || this.nuevaCita.hora || '';

        let mensaje = `Tu cita fue asignada con éxito con ${medicoNom}`;
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

        this.cargarDatosGlobales();
      },
      error: (err) => {
        console.error('Error al agendar cita:', err);
        this.dialogService.confirmar({
          titulo: 'Error',
          mensaje: err.error?.mensaje || 'Ocurrió un error al agendar la cita.',
          textoConfirmar: 'Entendido',
          textoCancelar: '',
          tipo: 'peligro',
        });
      },
    });
  }

  asignacionRapida(): void {
    this.dialogService
      .confirmar({
        titulo: 'Asignación automática',
        mensaje: '¿Deseas que el sistema te asigne automáticamente el primer médico con cupo disponible?',
        textoConfirmar: 'Sí, asignar',
        textoCancelar: 'Cancelar',
        tipo: 'info',
      })
      .then((confirmado) => {
        if (!confirmado) return;

        this.citaService.asignarCitaRapida({}).subscribe({
          next: (res: any) => {
            const datos = res.datos || {};
            const medicoNom =
              datos.medico?.Nombre ||
              datos.medico?.nombre ||
              datos.medico?.nombreCompleto ||
              'tu médico';
            const fecha = datos.fecha || '';
            const hora = datos.hora || '';

            let mensaje = res.mensaje || 'Cita asignada automáticamente';
            if (medicoNom && (fecha || hora)) {
              mensaje = `Tu cita fue asignada con éxito con ${medicoNom}`;
              if (fecha) mensaje += ` para el día ${fecha}`;
              if (hora) mensaje += ` a las ${hora}`;
              mensaje += '.';
            }

            this.dialogService.confirmar({
              titulo: 'Cita asignada',
              mensaje,
              textoConfirmar: 'Aceptar',
              textoCancelar: '',
              tipo: 'info',
            });
            this.cargarDatosGlobales();
          },
          error: (err) => {
            console.error('Error en asignación rápida:', err);
            const detalle = err.error?.error || err.error?.mensaje;
            this.dialogService.confirmar({
              titulo: 'Error',
              mensaje: detalle || 'Ocurrió un error al asignar la cita automáticamente',
              textoConfirmar: 'Entendido',
              textoCancelar: '',
              tipo: 'peligro',
            });
          },
        });
      });
  }

  abrirModalEditar(cita: any): void {
    const idPaciente =
      typeof cita.paciente === 'object' && cita.paciente !== null
        ? cita.paciente._id || cita.paciente.id
        : cita.paciente;
    const idMedico =
      typeof cita.medico === 'object' && cita.medico !== null
        ? cita.medico._id || cita.medico.id
        : cita.medico;

    this.citaEditando = {
      _id: cita._id,
      motivo: cita.motivo,
      estado: cita.estado,
      fecha: cita.fecha,
      hora: cita.hora,
      paciente: idPaciente || '',
      medico: idMedico || '',
    };

    if (this.esAdmin) {
      if (cita.fecha) {
        const f = new Date(String(cita.fecha).slice(0, 10));
        if (!isNaN(f.getTime())) {
          this.mesCalendario = new Date(f.getFullYear(), f.getMonth(), 1);
        }
      }
      this.fechaSeleccionada = cita.fecha || '';
      this.construirCalendario();
      this.cargarDisponibilidadMesEditar();
      this.cargarHorasSinFiltroHoy();
    }

    this.mostrarModalEditar = true;
  }

  cargarHorasSinFiltroHoy(): void {
    if (!this.citaEditando.medico || !this.citaEditando.fecha) {
      this.horasDisponibles = [];
      return;
    }
    this.cargandoHoras = true;
    this.citaService
      .obtenerHorasDisponibles(this.citaEditando.medico, this.citaEditando.fecha)
      .subscribe({
        next: (res: any) => {
          const horasDevueltas: string[] = res?.horas || [];
          this.horasDisponibles = this.horariosAtencion.filter((h) =>
            horasDevueltas.includes(h),
          );
          const horaActual = this.citaEditando.hora;
          if (horaActual && !this.horasDisponibles.includes(horaActual)) {
            this.horasDisponibles.push(horaActual);
            this.horasDisponibles.sort((a, b) =>
              this.horaAMinutos(a) - this.horaAMinutos(b),
            );
          }
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

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.horasDisponibles = [];
    this.fechaSeleccionada = '';
    this.citaEditando = {
      _id: '',
      motivo: '',
      estado: 'Disponible',
      fecha: '',
      hora: '',
      paciente: '',
      medico: '',
    };
  }

  actualizarCita(): void {
    if (!this.citaEditando._id) return;

    const { _id, ...datosAActualizar } = this.citaEditando;

    this.citaService.actualizarCita(_id, datosAActualizar).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.cargarDatosGlobales();
      },
      error: (err) => console.error('Error al actualizar cita:', err),
    });
  }

  puedeEliminarCita(cita: any): boolean {
    return this.esAdmin;
  }

  eliminarCita(id: string): void {
    if (!id) return;

    this.dialogService
      .confirmar({
        titulo: 'Eliminar cita',
        mensaje: '¿Estás seguro de que deseas eliminar esta cita permanentemente?',
        textoConfirmar: 'Eliminar',
        textoCancelar: 'Cancelar',
        tipo: 'peligro',
      })
      .then((confirmado) => {
        if (!confirmado) return;

        this.citaService.eliminarCita(id).subscribe({
          next: () => {
            this.cargarDatosGlobales();
          },
          error: (err) => {
            console.error('Error al eliminar cita:', err);
            this.dialogService.confirmar({
              titulo: 'Error',
              mensaje: err.error?.mensaje || 'Ocurrió un error al intentar eliminar la cita.',
              textoConfirmar: 'Entendido',
              textoCancelar: '',
              tipo: 'peligro',
            });
          },
        });
      });
  }

  esCitaDelPacienteLogueado(cita: any): boolean {
    if (this.rolUsuario !== 'paciente') return false;
    const emailUsuario = localStorage.getItem('emailUsuario');
    if (!emailUsuario) return false;
    return cita.paciente?.Correo === emailUsuario || cita.paciente?.email === emailUsuario;
  }

  esCitaDelMedicoLogueado(cita: any): boolean {
    if (this.rolUsuario !== 'medico') return false;
    if (!this.medicoId) return false;
    const citaMedicoId = typeof cita.medico === 'object' ? cita.medico?._id : cita.medico;
    return String(citaMedicoId) === String(this.medicoId);
  }

  puedeEditarCita(cita: any): boolean {
    if (this.esAdmin) return true;
    if (this.rolUsuario === 'medico') return this.esCitaDelMedicoLogueado(cita);
    return false;
  }

  cancelarCita(id: string): void {
    if (!id) return;

    this.dialogService
      .confirmar({
        titulo: 'Cancelar cita',
        mensaje: '¿Estás seguro de que deseas cancelar esta cita? El cupo quedará disponible.',
        textoConfirmar: 'Cancelar cita',
        textoCancelar: 'No, volver',
        tipo: 'advertencia',
      })
      .then((confirmado) => {
        if (!confirmado) return;

        this.citaService.actualizarCita(id, { estado: 'Cancelada' }).subscribe({
          next: () => {
            this.cargarDatosGlobales();
          },
          error: (err) => {
            console.error('Error al cancelar cita:', err);
            this.dialogService.confirmar({
              titulo: 'Error',
              mensaje: err.error?.mensaje || 'Ocurrió un error al intentar cancelar la cita.',
              textoConfirmar: 'Entendido',
              textoCancelar: '',
              tipo: 'peligro',
            });
          },
        });
      });
  }

  limpiarFormulario(): void {
    this.nuevaCita = {
      paciente: '',
      medico: '',
      fecha: '',
      hora: '',
      motivo: '',
    };
  }
}
