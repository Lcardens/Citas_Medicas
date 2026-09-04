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
            'Ingresa a "Pacientes" desde el menú.',
            'Usa el buscador para filtrar por nombre o documento.',
            'Haz clic en "Nuevo Paciente" para registrar uno.',
            'Para editar, haz clic en "Editar" en la tabla.',
            'Para eliminar, haz clic en "Eliminar" y confirma.',
          ],
        },
        {
          icono: 'bi-person-badge-fill',
          color: '#27b7f5',
          titulo: 'Gestionar Médicos',
          pasos: [
            'Ingresa a "Médicos" desde el menú.',
            'Filtra por nombre o registro médico con el buscador.',
            'Haz clic en "Nuevo Médico" para registrar.',
            'Configura su disponibilidad con el botón "Disponibilidad".',
            'Selecciona los días de la semana y las horas de atención.',
            'Puedes bloquear días puntuales como Licencia o Vacaciones.',
            'Para editar o eliminar, usa los botones de la tabla.',
          ],
        },
        {
          icono: 'bi-person-gear',
          color: '#6fbf8f',
          titulo: 'Gestionar Usuarios',
          pasos: [
            'Ingresa a "Usuarios" desde el menú.',
            'Filtra por nombre, email o rol.',
            'Puedes crear usuarios con rol Admin, Médico o Paciente.',
            'Para editar el nombre de un usuario, haz clic en "Editar".',
            'Para eliminar, se borran todos los datos vinculados.',
          ],
        },
        {
          icono: 'bi-calendar-check',
          color: '#f59e0b',
          titulo: 'Gestionar Citas',
          pasos: [
            'Ingresa a "Citas" desde el menú.',
            'Filtra por paciente, médico, fecha o estado.',
            'Haz clic en "Agendar Cita" para crear una nueva.',
            'Asigna paciente, médico, fecha, hora y motivo.',
            'Puedes editar o cancelar citas pendientes.',
          ],
        },
      ];
      this.faq = [
        {
          icono: 'bi-person-plus',
          color: '#8f7bd8',
          pregunta: '¿Cómo creo un usuario con rol Administrador?',
          respuesta: 'Desde "Usuarios", haz clic en "Nuevo Usuario" y selecciona el rol "Administrador". Solo los administradores pueden crear otros administradores.',
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
          respuesta: 'En la sección "Citas" o "Pacientes", escribe el nombre o número de documento en el campo de búsqueda. Los resultados se filtran en tiempo real.',
        },
        {
          icono: 'bi-shield-lock',
          color: '#6fbf8f',
          pregunta: '¿Qué es la Auditoría?',
          respuesta: 'La Auditoría registra todas las acciones realizadas en el sistema (creaciones, ediciones, eliminaciones). Puedes filtrar por usuario y fecha para revisar movimientos.',
        },
        {
          icono: 'bi-sliders',
          color: '#27b7f5',
          pregunta: '¿Cómo configuro la disponibilidad de un médico?',
          respuesta: 'En "Médicos", haz clic en "Disponibilidad". Puedes marcar los días de la semana y las horas de atención. Además puedes bloquear días puntuales marcándolos como Vacaciones, Licencia o Puntual; en esos días no se generarán citas.',
        },
        {
          icono: 'bi-bar-chart-line',
          color: '#f59e0b',
          pregunta: '¿Cómo veo los reportes?',
          respuesta: 'En "Reportes" encuentras un gráfico de distribución por estado y la lista de pacientes con más citas. Es útil para analizar la actividad del sistema.',
        },
      ];
    } else if (this.rol === 'medico') {
      this.guia = [
        {
          icono: 'bi-clipboard2-pulse',
          color: '#27b7f5',
          titulo: 'Ver Mi Agenda',
          pasos: [
            'Ingresa a "Mi Agenda" desde el menú.',
            'Verás las citas asignadas con su estado y hora.',
            'Usa el buscador para filtrar por paciente o fecha.',
            'Las citas pendientes aparecen en la parte superior.',
          ],
        },
        {
          icono: 'bi-check-circle',
          color: '#6fbf8f',
          titulo: 'Atender una Cita',
          pasos: [
            'Selecciona una cita pendiente o confirmada.',
            'Haz clic en "Atender".',
            'El estado cambiará a "Atendida" automáticamente.',
            'La cita quedará registrada en el historial.',
          ],
        },
        {
          icono: 'bi-person-gear',
          color: '#8f7bd8',
          titulo: 'Mi Perfil',
          pasos: [
            'Accede a "Mi Perfil" desde el menú.',
            'Puedes actualizar tu nombre.',
            'Tu registro médico y teléfono son de solo lectura.',
            'Para cambiar tu contraseña, haz clic en "Cambiar contraseña".',
          ],
        },
      ];
      this.faq = [
        {
          icono: 'bi-calendar-check',
          color: '#27b7f5',
          pregunta: '¿Cómo sé qué citas tengo pendientes?',
          respuesta: 'En "Mi Agenda", las citas pendientes aparecen listadas con la hora y el nombre del paciente. También puedes usar el buscador por fecha.',
        },
        {
          icono: 'bi-clock',
          color: '#f59e0b',
          pregunta: '¿Puedo cancelar una cita asignada a mí?',
          respuesta: 'No, solo el administrador puede cancelar o reprogramar citas. Si necesitas un cambio, comunícate con el admin.',
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
            'Haz clic en el botón "Agendar Cita".',
            'Selecciona la fecha del calendario.',
            'Elige un médico y la hora disponible.',
            'Escribe el motivo de la consulta.',
            'Presiona "Agendar" y listo.',
          ],
        },
        {
          icono: 'bi-clipboard2-pulse',
          color: '#27b7f5',
          titulo: 'Ver Mis Citas',
          pasos: [
            'En el menú, selecciona "Citas".',
            'Verás tus citas con su estado: Confirmada o Atendida.',
            'Puedes buscar por nombre del médico.',
            'Si necesitas cancelar, haz clic en "Cancelar".',
          ],
        },
        {
          icono: 'bi-x-circle',
          color: '#dc3545',
          titulo: 'Cancelar una Cita',
          pasos: [
            'En "Citas", busca la cita que deseas cancelar.',
            'Haz clic en el botón "Cancelar".',
            'Confirma la cancelación en la ventana emergente.',
            'La cita cambiará a estado "Cancelada".',
          ],
        },
        {
          icono: 'bi-person-gear',
          color: '#8f7bd8',
          titulo: 'Mi Perfil',
          pasos: [
            'Accede a "Mi Perfil" desde el menú.',
            'Puedes actualizar tu nombre y teléfono.',
            'También puedes cambiar tu contraseña.',
            'Los campos de documento y correo son de solo lectura.',
          ],
        },
      ];
      this.faq = [
        {
          icono: 'bi-calendar-check',
          color: '#6fbf8f',
          pregunta: '¿Cómo sé si mi cita fue confirmada?',
          respuesta: 'Cuando agendas una cita, queda confirmada automáticamente. Puedes ver el estado en "Citas".',
        },
        {
          icono: 'bi-clock-history',
          color: '#27b7f5',
          pregunta: '¿Puedo cancelar una cita confirmada?',
          respuesta: 'Sí, puedes cancelar una cita mientras no haya sido atendida. En "Citas", haz clic en "Cancelar". Si ya fue atendida, el botón no aparecerá.',
        },
        {
          icono: 'bi-search',
          color: '#8f7bd8',
          pregunta: '¿Cómo busco un médico específico?',
          respuesta: 'Al agendar una cita, usa el buscador que aparece en la parte superior. Puedes escribir el nombre del médico.',
        },
        {
          icono: 'bi-shield-lock',
          color: '#f59e0b',
          pregunta: '¿Cómo cambio mi contraseña?',
          respuesta: 'Accede a "Mi Perfil", haz clic en "Cambiar contraseña", escribe tu contraseña actual y la nueva (mínimo 6 caracteres), y presiona "Guardar cambios".',
        },
      ];
    }
  }
}
