import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.css'],
})
export class PacientesComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  pacientes: any[] = [];

  cargando = true;
  mostrarModal = false;

  busqueda = '';
  paginaActual = 1;
  elementosPorPagina = 10;

  nuevoPaciente = {
    TipoDocumento: 'CC',
    Documento: '',
    Nombre: '',
    Correo: '',
    Telefono: '',
  };

  ngOnInit(): void {
    this.obtenerPacientes();
  }

  get pacientesFiltrados(): any[] {
    let lista = this.pacientes;
    if (this.busqueda.trim()) {
      const q = this.busqueda.trim().toLowerCase();
      lista = lista.filter((p) => {
        const nombre = (p.Nombre || p.nombre || '').toLowerCase();
        const doc = (p.Documento || p.documento || '').toLowerCase();
        const correo = (p.Correo || p.correo || p.email || '').toLowerCase();
        const tipo = (p.TipoDocumento || '').toLowerCase();
        return nombre.includes(q) || doc.includes(q) || correo.includes(q) || tipo.includes(q);
      });
    }
    return lista;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.pacientesFiltrados.length / this.elementosPorPagina));
  }

  get pacientesPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.pacientesFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  get inicioRegistro(): number {
    return this.pacientesFiltrados.length === 0 ? 0 : (this.paginaActual - 1) * this.elementosPorPagina + 1;
  }

  get finRegistro(): number {
    return Math.min(this.paginaActual * this.elementosPorPagina, this.pacientesFiltrados.length);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }

  obtenerPacientes(): void {
    this.cargando = true;
    this.pacienteService.obtenerPacientes().subscribe({
      next: (respuesta: any) => {
        this.pacientes = respuesta?.datos || respuesta || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error del backend:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarPaciente(): void {
    this.pacienteService.crearPaciente(this.nuevoPaciente).subscribe({
      next: (res) => {
        this.cerrarModal();
        this.obtenerPacientes();
      },
      error: (err) => {
        console.error('Error al guardar paciente:', err);
      },
    });
  }

  limpiarFormulario(): void {
    this.nuevoPaciente = {
      TipoDocumento: 'CC',
      Documento: '',
      Nombre: '',
      Correo: '',
      Telefono: '',
    };
  }

  eliminarPaciente(id: string, nombre: string): void {
    this.dialogService
      .confirmar({
        titulo: 'Eliminar paciente',
        mensaje: `¿Eliminar al paciente "${nombre || ''}"? Se borrará también su usuario y sus citas. Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        textoCancelar: 'Cancelar',
        tipo: 'peligro',
      })
      .then((confirmado) => {
        if (!confirmado) return;

        this.pacienteService.eliminarPaciente(id).subscribe({
          next: (res: any) => {
            this.cdr.detectChanges();
            this.obtenerPacientes();
          },
          error: (err) => {
            console.error('Error al eliminar paciente:', err);
            this.cdr.detectChanges();
          },
        });
      });
  }
}
