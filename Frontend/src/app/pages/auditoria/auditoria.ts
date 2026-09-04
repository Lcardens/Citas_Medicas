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

  logs: any[] = [];
  cargando = true;
  totalPaginas = 1;
  totalRegistros = 0;

  filtros = {
    accion: '',
    usuario: '',
  };

  paginaActual = 1;
  limitePorPagina = 20;

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

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;
    this.auditService
      .listarLogs({
        ...this.filtros,
        pagina: this.paginaActual,
        limite: this.limitePorPagina,
      })
      .subscribe({
        next: (res: any) => {
          this.logs = res?.datos || [];
          this.totalPaginas = res?.totalPaginas || 1;
          this.totalRegistros = res?.total || 0;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar auditoría:', err);
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarLogs();
  }

  limpiarFiltros(): void {
    this.filtros = { accion: '', usuario: '' };
    this.paginaActual = 1;
    this.cargarLogs();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarLogs();
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    let inicio = Math.max(1, this.paginaActual - 2);
    let fin = Math.min(this.totalPaginas, inicio + 4);
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

  get inicioRegistro(): number {
    return (this.paginaActual - 1) * this.limitePorPagina + 1;
  }

  get finRegistro(): number {
    return Math.min(this.paginaActual * this.limitePorPagina, this.totalRegistros);
  }
}
