import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface Guiapaso {
  icono: string;
  color: string;
  titulo: string;
  pasos: string[];
}

interface FaqItem {
  icono: string;
  color: string;
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ayuda.html',
  styleUrls: ['./ayuda.css'],
})
export class AyudaComponent implements OnInit {
  private authService = inject(AuthService);

  rol: string = '';
  faqAbierto: number | null = null;
  guiaAbierto: number | null = null;

  guia: Guiapaso[] = [];
  faq: FaqItem[] = [];

  ngOnInit(): void {
    this.rol = this.authService.obtenerRol();
    this.cargarContenido();
  }

  toggleFaq(index: number): void {
    this.faqAbierto = this.faqAbierto === index ? null : index;
  }

  toggleGuia(index: number): void {
    this.guiaAbierto = this.guiaAbierto === index ? null : index;
  }

  private cargarContenido(): void {
    if (this.rol === 'admin') {
      this.guia = [
        {
          icono: 'bi-people-fill',
          color: '#8f7bd8',
          titulo: 'Gestionar Pacientes',
          pasos: [
            'Entrá a "Pacientes" desde el menú.',
            'Usá el buscador para filtrar por nombre o documento.',
            'Hacé clic en "Nuevo Paciente" para registrar uno.',
            'Para editar, hacé clic en "Editar" en la tabla.',
            'Para eliminar, hacé clic en "Eliminar" y confirmá.',
          ],
        },
        {
          icono: 'bi-person-badge-fill',
          color: '#27b7f5',
          titulo: 'Gestionar Médicos',
          pasos: [
            'Entrá a "Médicos" desde el menú.',
            'Filtrá por nombre o especialidad con el buscador.',
            'Hacé clic en "Nuevo Médico" para registrar.',
            'Cargá nombre, especialidad, teléfono, registro médico y disponibilidad.',
            'Para editar o eliminar, usá los botones de la tabla.',
          ],
        },
        {
          icono: 'bi-person-gear',
          color: '#6fbf8f',
          titulo: 'Gestionar Usuarios',
          pasos: [
            'Entrá a "Usuarios" desde el menú.',
            'Filtrá por nombre, email o rol.',
            'Solo podés crear usuarios con rol Médico o Paciente.',
            'Para editar el nombre de un usuario, hacé clic en "Editar".',
            'Para eliminar, se borran todos los datos vinculados.',
          ],
        },
        {
          icono: 'bi-calendar-check',
          color: '#f59e0b',
          titulo: 'Gestionar Citas',
          pasos: [
            'Entrá a "Citas" desde el menú.',
            'Filtrá por paciente, médico, fecha o estado.',
            'Hacé clic en "Agendar Cita" para crear una nueva.',
            'Asigná paciente, médico, fecha, hora y motivo.',
            'Podés editar o cancelar citas pendientes.',
          ],
        },
      ];
      this.faq = [
        {
          icono: 'bi-person-plus',
          color: '#8f7bd8',
          pregunta: '¿Cómo creo un usuario con rol Administrador?',
          respuesta: 'Desde "Usuarios", hacé clic en "Nuevo Usuario" y seleccioná el rol "Administrador". Solo los administradores pueden crear otros administradores.',
        },
        {
          icono: 'bi-calendar-x',
          color: '#dc3545',
          pregunta: '¿Qué pasa si elimino un paciente o médico?',
          respuesta: 'Se eliminan todos los datos vinculados: citas, historial y registros asociados. Esta acción no se puede deshacer.',
        },
        {
          icono: 'bi-search',
          color: '#27b7f5',
          pregunta: '¿Cómo busco un paciente específico?',
          respuesta: 'En la sección "Citas" o "Pacientes", escribí el nombre o número de documento en el campo de búsqueda. Los resultados se filtran en tiempo real.',
        },
        {
          icono: 'bi-shield-lock',
          color: '#6fbf8f',
          pregunta: '¿Qué es la Auditoría?',
          respuesta: 'La Auditoría registra todas las acciones realizadas en el sistema (creaciones, ediciones, eliminaciones). Podés filtrar por usuario y fecha para revisar movimientos.',
        },
        {
          icono: 'bi-bar-chart-line',
          color: '#f59e0b',
          pregunta: '¿Cómo veo los reportes?',
          respuesta: 'En "Reportes" encontrás un gráfico de distribución por estado y la lista de pacientes con más citas. Es útil para analizar la actividad del sistema.',
        },
      ];
    } else if (this.rol === 'medico') {
      this.guia = [
        {
          icono: 'bi-clipboard2-pulse',
          color: '#27b7f5',
          titulo: 'Ver Mi Agenda',
          pasos: [
            'Entrá a "Mi Agenda" desde el menú.',
            'Verás las citas asignadas con su estado y hora.',
            'Usá el buscador para filtrar por paciente o fecha.',
            'Las citas pendientes aparecen en la parte superior.',
          ],
        },
        {
          icono: 'bi-check-circle',
          color: '#6fbf8f',
          titulo: 'Atender una Cita',
          pasos: [
            'Seleccioná una cita pendiente o confirmada.',
            'Hacé clic en "Atender".',
            'El estado cambiará a "Atendida" automáticamente.',
            'La cita quedará registrada en el historial.',
          ],
        },
        {
          icono: 'bi-person-gear',
          color: '#8f7bd8',
          titulo: 'Mi Perfil',
          pasos: [
            'Accedé a "Mi Perfil" desde el menú.',
            'Podés actualizar tu nombre.',
            'Tu registro médico, especialidad y teléfono son de solo lectura.',
            'Para cambiar tu contraseña, hacé clic en "Cambiar contraseña".',
          ],
        },
      ];
      this.faq = [
        {
          icono: 'bi-calendar-check',
          color: '#27b7f5',
          pregunta: '¿Cómo sé qué citas tengo pendientes?',
          respuesta: 'En "Mi Agenda", las citas pendientes aparecen listadas con la hora y el nombre del paciente. También podés usar el buscador por fecha.',
        },
        {
          icono: 'bi-clock',
          color: '#f59e0b',
          pregunta: '¿Puedo cancelar una cita asignada a mí?',
          respuesta: 'No, solo el administrador puede cancelar o reprogramar citas. Si necesitás un cambio, comunicate con el admin.',
        },
        {
          icono: 'bi-check2-all',
          color: '#6fbf8f',
          pregunta: '¿Qué pasa cuando atiendo una cita?',
          respuesta: 'El estado cambia automáticamente a "Atendida". La cita queda registrada en el historial del paciente y en los reportes del sistema.',
        },
        {
          icono: 'bi-person',
          color: '#8f7bd8',
          pregunta: '¿Puedo ver el historial de un paciente?',
          respuesta: 'Actualmente no está disponible desde la vista del médico. Solo el administrador puede ver el historial completo desde "Pacientes".',
        },
      ];
    } else {
      this.guia = [
        {
          icono: 'bi-calendar-plus',
          color: '#6fbf8f',
          titulo: 'Agendar una Cita',
          pasos: [
            'Dirígete a "Citas" desde el menú.',
            'Hacé clic en el botón "Agendar Cita".',
            'Seleccioná la fecha del calendario.',
            'Elegí un médico y la hora disponible.',
            'Escribí el motivo de la consulta.',
            'Presioná "Agendar" y listo.',
          ],
        },
        {
          icono: 'bi-clipboard2-pulse',
          color: '#27b7f5',
          titulo: 'Ver Mis Turnos',
          pasos: [
            'En el menú, seleccioná "Mis Turnos".',
            'Verás tus citas con su estado: Pendiente, Confirmada o Atendida.',
            'Podés buscar por nombre del médico o especialidad.',
            'Si necesitás cancelar, hacé clic en "Cancelar".',
          ],
        },
        {
          icono: 'bi-x-circle',
          color: '#dc3545',
          titulo: 'Cancelar una Cita',
          pasos: [
            'En "Mis Turnos", buscá la cita que deseás cancelar.',
            'Hacé clic en el botón "Cancelar".',
            'Confirmá la cancelación en la ventana emergente.',
            'La cita cambiará a estado "Cancelada".',
          ],
        },
        {
          icono: 'bi-person-gear',
          color: '#8f7bd8',
          titulo: 'Mi Perfil',
          pasos: [
            'Accedé a "Mi Perfil" desde el menú.',
            'Podés actualizar tu nombre y teléfono.',
            'También podés cambiar tu contraseña.',
            'Los campos de documento y correo son de solo lectura.',
          ],
        },
      ];
      this.faq = [
        {
          icono: 'bi-calendar-check',
          color: '#6fbf8f',
          pregunta: '¿Cómo sé si mi cita fue confirmada?',
          respuesta: 'Cuando agendás una cita, el estado será "Pendiente". El médico o el administrador deberán confirmarla. Podés ver el estado en "Mis Turnos".',
        },
        {
          icono: 'bi-clock-history',
          color: '#27b7f5',
          pregunta: '¿Puedo cancelar una cita ya confirmada?',
          respuesta: 'Sí, podés cancelar una cita mientras no haya sido atendida. En "Mis Turnos", hacé clic en "Cancelar". Si ya fue atendida, el botón no aparecerá.',
        },
        {
          icono: 'bi-search',
          color: '#8f7bd8',
          pregunta: '¿Cómo busco un médico específico?',
          respuesta: 'Al agendar una cita, usá el buscador que aparece en la parte superior. Podés escribir el nombre del médico o su especialidad.',
        },
        {
          icono: 'bi-shield-lock',
          color: '#f59e0b',
          pregunta: '¿Cómo cambio mi contraseña?',
          respuesta: 'Entrá a "Mi Perfil", hacé clic en "Cambiar contraseña", escribí tu contraseña actual y la nueva (mínimo 6 caracteres), y presioná "Guardar cambios".',
        },
      ];
    }
  }
}
