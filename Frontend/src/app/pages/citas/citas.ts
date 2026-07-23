import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CitaService } from '../../services/cita';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
})
export class CitasComponent implements OnInit {
  public authService = inject(AuthService);
  private citaService = inject(CitaService);
  private userService = inject(UserService);

  // Estado del menú
  seccionActiva: string = 'citas';
  cargando: boolean = false;
  mensaje: string = '';

  // Datos guardados
  citas: any[] = [];
  pacientes: any[] = [];
  medicos: any[] = [];

  // Formulario Asignar Cita
  citaId: string = '';
  pacienteId: string = '';

  // Formulario Crear Usuario
  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'paciente',
  };

  ngOnInit() {
    this.cargarCitas();
  }

  // --- MÉTODOS DE CONSULTA (GET) ---

  cargarCitas() {
    this.cargando = true;
    this.citaService.obtenerCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.cargando = false;
      },
    });
  }

  cargarPacientes() {
    this.cargando = true;
    this.userService.obtenerUsuariosPorRol('paciente').subscribe({
      next: (data) => {
        this.pacientes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
        this.cargando = false;
      },
    });
  }

  cargarMedicos() {
    this.cargando = true;
    this.userService.obtenerUsuariosPorRol('medico').subscribe({
      next: (data) => {
        this.medicos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar médicos:', err);
        this.cargando = false;
      },
    });
  }

  // --- MÉTODOS DE ACCIÓN (POST / PATCH) ---

  crearUsuario() {
    this.mensaje = '';
    this.userService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.mensaje = '✅ Usuario creado con éxito';
        this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'paciente' };
      },
      error: (err) => {
        this.mensaje = '❌ Error: ' + (err.error?.mensaje || 'No se pudo crear el usuario');
      },
    });
  }

  asignarCita() {
    this.mensaje = '';
    this.citaService.asignarCita(this.citaId, this.pacienteId).subscribe({
      next: () => {
        this.mensaje = '✅ Cita asignada correctamente';
        this.citaId = '';
        this.pacienteId = '';
        this.cargarCitas();
      },
      error: (err) => {
        this.mensaje = '❌ Error: ' + (err.error?.mensaje || 'No se pudo asignar la cita');
      },
    });
  }

  cerrarSesion() {
    this.authService.logout();
    window.location.reload();
  }
}
