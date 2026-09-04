import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mensajeError: string = '';
  usuarioIdActual: string = '';
  rolFiltro: string = '';
  busqueda: string = '';
  paginaActual = 1;
  elementosPorPagina = 10;
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'paciente',
  };

  usuarioEditando: any = null;
  usuarioEditandoBackup: any = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioIdActual = localStorage.getItem('usuarioId') || '';
    this.obtenerUsuarios();
  }

  get usuariosFiltrados(): any[] {
    let lista = this.usuarios;

    if (this.rolFiltro) {
      lista = lista.filter((u) => {
        const rol = String(u.rol || '').toLowerCase().trim();
        if (this.rolFiltro === 'usuario') {
          return rol === 'usuario' || rol === 'paciente';
        }
        if (this.rolFiltro === 'administrador') {
          return rol === 'administrador' || rol === 'admin';
        }
        return rol === this.rolFiltro;
      });
    }

    if (this.busqueda.trim()) {
      const q = this.busqueda.trim().toLowerCase();
      lista = lista.filter((u) => {
        const nombre = (u.nombre || u.Nombre || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const rol = (u.rol || '').toLowerCase();
        return nombre.includes(q) || email.includes(q) || rol.includes(q);
      });
    }

    return lista;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.elementosPorPagina));
  }

  get usuariosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  get inicioRegistro(): number {
    return this.usuariosFiltrados.length === 0 ? 0 : (this.paginaActual - 1) * this.elementosPorPagina + 1;
  }

  get finRegistro(): number {
    return Math.min(this.paginaActual * this.elementosPorPagina, this.usuariosFiltrados.length);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }

  obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (res: any) => {
        const datosRespuesta = res?.datos || res?.usuarios || (Array.isArray(res) ? res : []);
        this.usuarios = [...datosRespuesta];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener usuarios:', err);
      },
    });
  }

  abrirModal(): void {
    this.mensajeError = '';
    this.mostrarModalCrear = true;
  }

  cerrarModal(): void {
    this.mostrarModalCrear = false;
    this.mensajeError = '';
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      password: '',
      rol: 'paciente',
    };
  }

  crearUsuario(): void {
    this.mensajeError = '';

    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    if (this.nuevoUsuario.password.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.usuarioService.registrarUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.cerrarModal();
        this.obtenerUsuarios();
      },
      error: (err: any) => {
        console.error('Error al registrar usuario:', err);
        this.mensajeError = err.error?.mensaje || 'Error al guardar el usuario.';
      },
    });
  }

  esUsuarioActual(id: string): boolean {
    return this.usuarioIdActual === id;
  }

  abrirModalEditar(usuario: any): void {
    this.mensajeError = '';
    this.usuarioEditando = {
      _id: usuario._id,
      nombre: usuario.nombre || usuario.Nombre || '',
      email: usuario.email || '',
      rol: usuario.rol || 'paciente',
    };
    this.usuarioEditandoBackup = { ...this.usuarioEditando };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.mensajeError = '';
    this.usuarioEditando = null;
  }

  guardarEdicion(): void {
    this.mensajeError = '';
    if (!this.usuarioEditando?.nombre || !this.usuarioEditando?.email) {
      this.mensajeError = 'Nombre y correo son obligatorios.';
      return;
    }
    const campos: any = {};
    if (this.usuarioEditando.nombre !== this.usuarioEditandoBackup.nombre) {
      campos.nombre = this.usuarioEditando.nombre;
    }
    if (this.usuarioEditando.email !== this.usuarioEditandoBackup.email) {
      campos.email = this.usuarioEditando.email;
    }
    if (this.usuarioEditando.rol !== this.usuarioEditandoBackup.rol) {
      campos.rol = this.usuarioEditando.rol;
    }
    if (Object.keys(campos).length === 0) {
      this.cerrarModalEditar();
      return;
    }
    this.usuarioService.editarUsuario(this.usuarioEditando._id, campos).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.obtenerUsuarios();
      },
      error: (err: any) => {
        this.mensajeError = err.error?.mensaje || 'Error al guardar los cambios.';
      },
    });
  }

  eliminarUsuario(id: string, nombre: string): void {
    this.dialogService
      .confirmar({
        titulo: 'Eliminar usuario',
        mensaje: `¿Eliminar al usuario "${nombre || ''}"? Se borrará también su perfil y sus citas. Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        textoCancelar: 'Cancelar',
        tipo: 'peligro',
      })
      .then((confirmado) => {
        if (!confirmado) return;

        this.usuarioService.eliminarUsuario(id).subscribe({
          next: (res: any) => {
            this.cdr.detectChanges();
            this.obtenerUsuarios();
          },
          error: (err: any) => {
            console.error('Error al eliminar usuario:', err);
            this.cdr.detectChanges();
          },
        });
      });
  }
}
