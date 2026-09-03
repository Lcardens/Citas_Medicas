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

  busqueda = '';
  paginaActual = 1;
  elementosPorPagina = 10;

  esPersonalMedico = false;

  nuevoMedico = {
    Registromedico: '',
    Nombre: '',
  };

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
