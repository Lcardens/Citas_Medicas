import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../core/services/medico.service';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos.html',
  styleUrls: ['./medicos.css'],
})
export class MedicosComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  medicos: any[] = [];
  cargando = true;
  mostrarModal = false;
  mostrarModalDisponibilidad = false;

  busqueda = '';
  paginaActual = 1;
  elementosPorPagina = 10;

  esPersonalMedico = false;

  nuevoMedico = {
    Registromedico: '',
    Nombre: '',
  };

  disponibilidad = {
    medicoNombre: '',
    diasAtencion: [1, 2, 3, 4, 5],
    horasAtencion: [
      '08:00 AM',
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
      '05:00 PM',
      '06:00 PM',
    ],
    diasBloqueados: [] as { fecha: string; tipo: string }[],
  };

  medicoEnDisponibilidad: any = null;
  diasDisponibles = [
    { valor: 1, nombre: 'Lun' },
    { valor: 2, nombre: 'Mar' },
    { valor: 3, nombre: 'Mié' },
    { valor: 4, nombre: 'Jue' },
    { valor: 5, nombre: 'Vie' },
    { valor: 6, nombre: 'Sáb' },
    { valor: 0, nombre: 'Dom' },
  ];
  horasPosibles = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];
  tiposBloqueo = [
    { valor: 'vacaciones', nombre: 'Vacaciones' },
    { valor: 'licencia', nombre: 'Licencia' },
    { valor: 'puntual', nombre: 'Puntual' },
  ];

  nuevaFechaBloqueo: string = '';
  tipoBloqueo = 'vacaciones';
  mensajeDisponibilidad = '';
  guardandoDisponibilidad = false;

  ngOnInit(): void {
    this.esPersonalMedico = this.authService.esPersonalMedico();
    this.obtenerMedicos();
  }

  get medicosFiltrados(): any[] {
    let lista = this.medicos;
    if (this.busqueda.trim()) {
      const q = this.busqueda.trim().toLowerCase();
      lista = lista.filter((m) => {
        const nombre = (m.Nombre || m.nombre || '').toLowerCase();
        const registro = (m.Registromedico || m.registroMedico || '').toLowerCase();
        return nombre.includes(q) || registro.includes(q);
      });
    }
    return lista;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.medicosFiltrados.length / this.elementosPorPagina));
  }

  get medicosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.medicosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  get inicioRegistro(): number {
    return this.medicosFiltrados.length === 0 ? 0 : (this.paginaActual - 1) * this.elementosPorPagina + 1;
  }

  get finRegistro(): number {
    return Math.min(this.paginaActual * this.elementosPorPagina, this.medicosFiltrados.length);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }

  obtenerMedicos(): void {
    this.cargando = true;
    this.medicoService.obtenerMedicos().subscribe({
      next: (respuesta: any) => {
        this.medicos = respuesta?.datos || respuesta || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener médicos:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModal(): void {
    if (!this.esPersonalMedico) return;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarMedico(): void {
    if (!this.esPersonalMedico) return;

    this.medicoService.crearMedico(this.nuevoMedico).subscribe({
      next: (res) => {
        this.cerrarModal();
        this.obtenerMedicos();
      },
      error: (err) => console.error('Error al crear médico:', err),
    });
  }

  limpiarFormulario(): void {
    this.nuevoMedico = {
      Registromedico: '',
      Nombre: '',
    };
  }

  abrirDisponibilidad(medico: any): void {
    if (!this.esPersonalMedico) return;
    this.medicoEnDisponibilidad = medico;
    this.disponibilidad.medicoNombre = medico.Nombre || medico.nombre || '';
    this.disponibilidad.diasAtencion = Array.isArray(medico.diasAtencion) && medico.diasAtencion.length
      ? [...medico.diasAtencion]
      : [1, 2, 3, 4, 5];
    this.disponibilidad.horasAtencion = Array.isArray(medico.horasAtencion) && medico.horasAtencion.length
      ? [...medico.horasAtencion]
      : [...this.horasPosibles];
    this.disponibilidad.diasBloqueados = Array.isArray(medico.diasBloqueados)
      ? medico.diasBloqueados
          .map((d: any) => ({
            fecha: typeof d === 'string' ? String(d).slice(0, 10) : String(d?.fecha || '').slice(0, 10),
            tipo: typeof d === 'string' ? 'puntual' : d?.tipo || 'puntual',
          }))
          .filter((x: any) => x.fecha)
      : [];
    this.tipoBloqueo = 'vacaciones';
    this.nuevaFechaBloqueo = '';
    this.mensajeDisponibilidad = '';
    this.mostrarModalDisponibilidad = true;
  }

  cerrarDisponibilidad(): void {
    this.mostrarModalDisponibilidad = false;
    this.medicoEnDisponibilidad = null;
  }

  toggleDia(dia: number): void {
    const idx = this.disponibilidad.diasAtencion.indexOf(dia);
    if (idx >= 0) {
      this.disponibilidad.diasAtencion.splice(idx, 1);
    } else {
      this.disponibilidad.diasAtencion.push(dia);
    }
  }

  toggleHora(hora: string): void {
    const idx = this.disponibilidad.horasAtencion.indexOf(hora);
    if (idx >= 0) {
      this.disponibilidad.horasAtencion.splice(idx, 1);
    } else {
      this.disponibilidad.horasAtencion.push(hora);
    }
  }

  agregarFechaBloqueo(): void {
    const fecha = String(this.nuevaFechaBloqueo || '').slice(0, 10);
    if (!fecha) return;
    const existente = this.disponibilidad.diasBloqueados.find((x) => x.fecha === fecha);
    if (existente) {
      existente.tipo = this.tipoBloqueo;
    } else {
      this.disponibilidad.diasBloqueados.push({ fecha, tipo: this.tipoBloqueo });
    }
    this.nuevaFechaBloqueo = '';
  }

  quitarFechaBloqueo(fecha: string): void {
    this.disponibilidad.diasBloqueados = this.disponibilidad.diasBloqueados.filter((x) => x.fecha !== fecha);
  }

  nombreTipo(tipo: string): string {
    const t = this.tiposBloqueo.find((x) => x.valor === tipo);
    return t ? t.nombre : 'Puntual';
  }

  claseTipo(tipo: string): string {
    if (tipo === 'licencia') return 'text-bg-warning';
    if (tipo === 'vacaciones') return 'text-bg-primary';
    return 'text-bg-danger';
  }

  formatearFecha(fecha: string): string {
    const partes = String(fecha || '').split('-');
    if (partes.length !== 3) return fecha;
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }

  guardarDisponibilidad(): void {
    if (!this.medicoEnDisponibilidad) return;
    this.guardandoDisponibilidad = true;
    this.mensajeDisponibilidad = '';

    this.medicoService.actualizarDisponibilidad(this.medicoEnDisponibilidad._id, {
      diasAtencion: this.disponibilidad.diasAtencion,
      horasAtencion: this.disponibilidad.horasAtencion,
      diasBloqueados: this.disponibilidad.diasBloqueados,
    }).subscribe({
      next: (res: any) => {
        this.mensajeDisponibilidad = res?.mensaje || 'Disponibilidad actualizada.';
        const fechaMensaje = res?.datos?.cuposRetirados;
        if (typeof fechaMensaje === 'number' && fechaMensaje > 0) {
          this.mensajeDisponibilidad += ` Se retiraron ${fechaMensaje} cupo(s) sin reservar.`;
        }
        this.guardandoDisponibilidad = false;
        if (this.medicoEnDisponibilidad) {
          this.medicoEnDisponibilidad.diasAtencion = this.disponibilidad.diasAtencion;
          this.medicoEnDisponibilidad.horasAtencion = this.disponibilidad.horasAtencion;
          this.medicoEnDisponibilidad.diasBloqueados = [...this.disponibilidad.diasBloqueados];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensajeDisponibilidad = err?.error?.mensaje || 'Error al actualizar la disponibilidad.';
        this.guardandoDisponibilidad = false;
        this.cdr.detectChanges();
      },
    });
  }

  eliminarMedico(id: string, nombre: string): void {
    this.dialogService
      .confirmar({
        titulo: 'Eliminar médico',
        mensaje: `¿Eliminar al médico "${nombre || ''}"? Se borrará también su usuario y sus citas. Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        textoCancelar: 'Cancelar',
        tipo: 'peligro',
      })
      .then((confirmado) => {
        if (!confirmado) return;

        this.medicoService.eliminarMedico(id).subscribe({
          next: (res: any) => {
            this.cdr.detectChanges();
            this.obtenerMedicos();
          },
          error: (err) => {
            console.error('Error al eliminar médico:', err);
            this.cdr.detectChanges();
          },
        });
      });
  }
}
