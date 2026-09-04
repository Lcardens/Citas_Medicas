import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './auditoria.html',
  styleUrls: ['./auditoria.css'],
})
export class AuditoriaComponent implements OnInit {
  private auditService = inject(AuditService);
  private cdr = inject(ChangeDetectorRef);

  vista: 'resumen' | 'detalle' = 'resumen';

  cargando = true;

  filtrosResumen = {
    usuario: '',
    fechaInicio: '',
    fechaFin: '',
  };

  usuarioSeleccionado: any = null;
  logsDetalle: any[] = [];
  pagDetalle = 1;
  totalPagDetalle = 1;
  totalDetalle = 0;

  filtrosDetalle = {
    accion: '',
    fechaInicio: '',
    fechaFin: '',
  };

  accionOpciones = [
    { valor: '', etiqueta: 'Todas las acciones' },
    { valor: 'crear_cita', etiqueta: 'Crear cita' },
    { valor: 'actualizar_cita', etiqueta: 'Actualizar cita' },
    { valor: 'eliminar_cita', etiqueta: 'Eliminar cita' },
    { valor: 'asignar_cita', etiqueta: 'Asignar cita' },
    { valor: 'crear_usuario', etiqueta: 'Crear usuario' },
    { valor: 'eliminar_usuario', etiqueta: 'Eliminar usuario' },
    { valor: 'login', etiqueta: 'Login exitoso' },
    { valor: 'login_fallido', etiqueta: 'Login fallido' },
    { valor: 'registro', etiqueta: 'Registro' },
    { valor: 'actualizar_perfil', etiqueta: 'Actualizar perfil' },
  ];

  usuariosResumen: any[] = [];

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.auditService
      .listarLogs({ ...this.filtrosResumen, resumen: true })
      .subscribe({
        next: (res: any) => {
          this.usuariosResumen = res?.datos || [];
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
  }

  abrirDetalle(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.vista = 'detalle';
    this.pagDetalle = 1;
    this.filtrosDetalle = { accion: '', fechaInicio: '', fechaFin: '' };
    this.cargarDetalle();
  }

  cargarDetalle(): void {
    this.cargando = true;
    const filtros: any = {
      usuarioId: this.usuarioSeleccionado.usuarioId,
      pagina: this.pagDetalle,
      limite: 20,
    };
    if (this.filtrosDetalle.accion) filtros.accion = this.filtrosDetalle.accion;
    if (this.filtrosDetalle.fechaInicio) filtros.fechaInicio = this.filtrosDetalle.fechaInicio;
    if (this.filtrosDetalle.fechaFin) filtros.fechaFin = this.filtrosDetalle.fechaFin;
    this.auditService.listarLogs(filtros).subscribe({
      next: (res: any) => {
        this.logsDetalle = res?.datos || [];
        this.totalPagDetalle = res?.totalPaginas || 1;
        this.totalDetalle = res?.total || 0;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  volverResumen(): void {
    this.vista = 'resumen';
    this.usuarioSeleccionado = null;
    this.logsDetalle = [];
    this.cargarResumen();
  }

  buscarResumen(): void {
    this.cargarResumen();
  }

  limpiarResumen(): void {
    this.filtrosResumen = { usuario: '', fechaInicio: '', fechaFin: '' };
    this.cargarResumen();
  }

  buscarDetalle(): void {
    this.pagDetalle = 1;
    this.cargarDetalle();
  }

  limpiarDetalle(): void {
    this.filtrosDetalle = { accion: '', fechaInicio: '', fechaFin: '' };
    this.pagDetalle = 1;
    this.cargarDetalle();
  }

  cambiarPagDetalle(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPagDetalle) return;
    this.pagDetalle = pagina;
    this.cargarDetalle();
  }

  get paginasVisiblesDetalle(): number[] {
    const paginas: number[] = [];
    let inicio = Math.max(1, this.pagDetalle - 2);
    let fin = Math.min(this.totalPagDetalle, inicio + 4);
    inicio = Math.max(1, fin - 4);
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }

  formatearAccion(accion: string): string {
    const mapa: Record<string, string> = {
      crear_cita: 'Crear cita',
      actualizar_cita: 'Actualizar cita',
      eliminar_cita: 'Eliminar cita',
      asignar_cita: 'Asignar cita',
      crear_usuario: 'Crear usuario',
      eliminar_usuario: 'Eliminar usuario',
      login: 'Login exitoso',
      login_fallido: 'Login fallido',
      registro: 'Registro',
      actualizar_perfil: 'Actualizar perfil',
    };
    return mapa[accion] || accion;
  }

  claseAccion(accion: string): string {
    if (accion.includes('eliminar')) return 'bg-danger-subtle text-danger';
    if (accion.includes('crear') || accion.includes('asignar') || accion === 'registro')
      return 'bg-success-subtle text-success';
    if (accion.includes('actualizar')) return 'bg-warning-subtle text-warning';
    if (accion === 'login') return 'bg-info-subtle text-info';
    if (accion === 'login_fallido') return 'bg-danger-subtle text-danger';
    return 'bg-secondary-subtle text-secondary';
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
