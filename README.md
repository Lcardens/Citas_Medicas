# Sistema de Citas Médicas

Aplicación web fullstack para la gestión integral de citas médicas. Permite a pacientes, médicos y administradores agendar, asignar y administrar citas de forma centralizada y segura.

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Ejecución en entorno local](#ejecución-en-entorno-local)
- [Despliegue en producción](#despliegue-en-producción)
- [Endpoints de la API](#endpoints-de-la-api)
- [Roles y permisos](#roles-y-permisos)
- [Mejoras futuras](#mejoras-futuras)
- [Autor](#autor)

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular, TypeScript, Bootstrap 5 |
| Backend | Node.js, Express |
| Base de datos | MongoDB Atlas (Mongoose) |
| Autenticación | JWT + bcryptjs |
| Gráficos | Chart.js |
| Despliegue | Ubuntu, Nginx, PM2 |

---

## Funcionalidades

### Autenticación y roles
- Registro e inicio de sesión con roles: **administrador**, **médico** y **paciente**.
- Sesión persistente con token JWT en `localStorage`.
- Middleware de protección de rutas y autorización por roles (`auth.guard`, `role.guard`, `admin.guard`).
- Perfil propio: cada usuario puede consultar y actualizar su nombre, teléfono y contraseña, con validación de la contraseña actual.
- El registro de un médico valida que el `RegistroMedico` exista previamente y lo vincula por correo.

### Gestión de pacientes (administrador)
- Crear pacientes con tipo de documento, documento, nombre, correo y teléfono.
- Listar pacientes registrados.
- Eliminar pacientes con borrado en cascada de sus datos asociados.

### Gestión de médicos (administrador)
- Crear médicos con registro médico y nombre.
- Eliminar médicos con borrado en cascada de datos asociados.
- **Configurar disponibilidad** (botón "Disponibilidad" en la tabla): seleccionar días de la semana (Lun-Dom) y horas de atención de un médico, además de bloquear días puntuales usando Vacaciones o Licencia (rangos de fechas). Al guardar, se retiran automáticamente los cupos "Disponible" sin reservar que ya no coinciden con la nueva configuración.

### Gestión de usuarios (administrador)
- Listar todos los usuarios del sistema.
- Eliminar usuarios con borrado en cascada de datos asociados.
- Crear usuarios con rol Administrador, Médico o Paciente.

### Auditoría (administrador)
- Registro automático de acciones relevantes en el sistema (creación de usuarios, login, registro de médicos, etc.).
- Página de Auditoría con vista resumen (acciones por usuario) y vista detallada (log cronológico) con filtros por usuario y fecha.

### Centro de ayuda (todos los roles)
- Página de ayuda accesible desde el menú hamburguesa y el footer del panel.
- Guía paso a paso por rol (Administrador, Médico, Paciente) con acordeón desplegable.
- Preguntas frecuentes con información relevante por rol.
- Sección de contacto institucional.

### Perfil y estilos por rol
- Barra de navegación, perfil, avatar y etiquetas con degradados según el rol: administrador (lavanda), médico (azul) y paciente (verde).
- El perfil del administrador muestra el cargo "Administrador de Sistema" y oculta los campos de documento y registro médico.
- Perfil del médico conserva el registro médico y teléfono de solo lectura; el paciente conserva documento y correo de solo lectura.
- Cambio de contraseña con validación de la contraseña actual.

### Gestión de citas médicas
- **Agendar cita**: el paciente elige médico, fecha y hora entre los cupos realmente disponibles.
- **Asignación automática**: el sistema asigna el próximo cupo disponible.
- **Asignación rápida**: el propio paciente solicita que el sistema le asigne automáticamente el primer médico con disponibilidad.
- **Cancelación**: los pacientes pueden cancelar sus propias citas.
- **Estados de cita**: Confirmada, Disponible, Atendida (con diagnóstico) y Cancelada, diferenciadas con colores.
- **Agenda del médico**: vista de turnos propia para el médico logueado.
- **Filtros por columna**: la tabla de citas permite filtrar por médico, estado y fecha (estilo filtros de Excel), con botón para limpiar. Los pacientes solo ven sus propias citas.

### Disponibilidad de citas
- **Modelo por día, bajo demanda**: los cupos se generan solamente cuando un paciente selecciona un día concreto en el calendario, no por adelantado para meses enteros.
- Las horas vencidas del día actual se descartan.
- **Configuración por médico**: el administrador define los días de la semana y horas de atención de cada médico; también puede bloquear rangos de días con motivo Vacaciones o Licencia.
- **Calendario mensual**: los días que ya tienen cupos creados se muestran en verde ("Con disponibilidad"); los días sin cupos quedan seleccionables y generan los slots bajo demanda al elegirlos. Los días pasados quedan bloqueados.

### Reportes (administrador)
- **Distribución por estado**: gráfico de dona (Confirmada, Disponible, Atendida, Cancelada) con colores pastel.
- **Pacientes frecuentes**: tabla de pacientes con más citas.
- **Resumen**: total de citas, disponibles, confirmadas, atendidas y canceladas.

---

## Estructura del proyecto

```
Proyecto_Final/
├── Backend/
│   ├── config/
│   │   └── db.js                    # Conexión a MongoDB
│   ├── controllers/
│   │   ├── authController.js        # Registro, login, perfil propio, usuarios
│   │   ├── auditController.js       # Registro y lista de logs de auditoría
│   │   ├── citaController.js        # CRUD de citas, asignación y disponibilidad
│   │   ├── medicoController.js      # CRUD de médicos y disponibilidad
│   │   ├── pacienteController.js    # CRUD de pacientes
│   │   └── reporteController.js     # Reportes (distribución, pacientes frecuentes)
│   ├── middleware/
│   │   └── auth.js                  # Protección (JWT) y autorización por roles
│   ├── models/
│   │   ├── user.js                  # Usuario de autenticación
│   │   ├── cita.js                  # Cita (referencia a Paciente y Medico)
│   │   ├── medico.js                # Médico (con disponibilidad configurable)
│   │   ├── Paciente.js              # Paciente
│   │   └── auditLog.js              # Registro de acciones de auditoría
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── auditRoutes.js           # /api/audit/*
│   │   ├── citaRoutes.js            # /api/citas/*
│   │   ├── medicoRoutes.js          # /api/medicos/*
│   │   ├── pacienteRoutes.js        # /api/pacientes/*
│   │   └── reporteRoutes.js         # /api/reportes/*
│   ├── utils/
│   │   └── passwordUtils.js         # Hash y comparación de contraseñas
│   ├── index.js                     # Punto de entrada del servidor
│   ├── .env                         # Variables de entorno (no versionado)
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── guards/          # auth, role, admin
│   │       │   ├── interceptors/    # auth.interceptor
│   │       │   └── services/        # auth, cita, medico, paciente, reporte, usuario
│   │       ├── pages/
│   │       │   ├── login/           # Login + Registro
│   │       │   ├── dashboard/       # Layout con barra de navegación
│   │       │   ├── inicio/          # Bienvenida
│   │       │   ├── citas/           # Gestión de citas (con calendario y filtros)
│   │       │   ├── misturnos/       # Agenda del médico
│   │       │   ├── pacientes/       # Gestión de pacientes
│   │       │   ├── medicos/         # Gestión de médicos y disponibilidad
│   │       │   ├── usuarios/        # Lista de usuarios
│   │       │   ├── auditoria/       # Log de auditoría (admin)
│   │       │   ├── ayuda/           # Centro de ayuda (todos los roles)
│   │       │   ├── reportes/        # Reportes (admin)
│   │       │   └── perfil/          # Perfil del usuario logueado
│   │       ├── app.config.ts        # Proveedores (router e interceptor)
│   │       └── app.routes.ts        # Rutas con guards
│   └── environments/
│       ├── environment.ts           # Configuración de producción
│       └── environment.development.ts # Configuración de desarrollo
│
├── deploy.ps1                       # Script de despliegue del frontend (Windows)
├── deploy.bat                       # Atajo para deploy.ps1
└── README.md
```

---

## Requisitos previos

- Node.js 18 o superior.
- Una instancia de MongoDB (local o MongoDB Atlas).
- Angular CLI instalado de forma global.

---

## Ejecución en entorno local

### 1. Configurar variables de entorno

Crea el archivo `Backend/.env` con la configuración de tu instancia de MongoDB:

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<base_de_datos>
PORT=3000
JWT_SECRET=<clave_secreta_larga_y_aleatoria>
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

> **Importante:** no compartas este archivo. Asegúrate de que esté incluido en `.gitignore`.

### 2. Iniciar el backend

```bash
cd Backend
npm install
npm run dev
```

El servidor arranca en `http://localhost:3000`.

### 3. Iniciar el frontend

```bash
cd Frontend
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`. Las peticiones `/api/*` se proxean automáticamente al backend mediante `proxy.conf.json`.

---

## Despliegue en producción

El proyecto está preparado para desplegarse en un servidor **Ubuntu** con **Nginx** como servidor web y **PM2** para mantener el backend en ejecución.

### Arquitectura

```
               ┌─────────────────────────────────────────────┐
               │                 Servidor Ubuntu             │
               │                                             │
   Usuarios ─► │  Nginx (puerto 80)                          │
               │   ├── /  -> /var/www/html   (frontend)      │
               │   └── /api/ -> proxy a 127.0.0.1:3000       │
               │                                             │
               │  PM2 -> Backend (Express, puerto 3000)       │
               │       └── MongoDB Atlas                      │
               └─────────────────────────────────────────────┘
```

### Configuración recomendada

1. **Servidor:** droplet de DigitalOcean con Ubuntu y Nginx instalado.
2. **Frontend:** build estático servido por Nginx desde `/var/www/html`.
3. **Backend:** Node.js/Express gestionado con PM2; Nginx redirige `/api/*` hacia el puerto del backend.
4. **Base de datos:** MongoDB Atlas, configurada en `Backend/.env`.

### Despliegue del frontend

Desde el entorno de desarrollo, se genera el build de producción y se copia al servidor:

```bash
# Generar el build (dentro de Frontend/)
ng build --configuration production

# Vaciar los archivos antiguos del servidor
ssh <usuario>@<ip_servidor> "rm -rf /var/www/html/*"

# Copiar el build al servidor
scp -r Frontend/dist/frontend/browser/* <usuario>@<ip_servidor>:/var/www/html/

# Ajustar permisos y recargar Nginx
ssh <usuario>@<ip_servidor> "chmod -R a+rX /var/www/html && nginx -s reload"
```

> **Nota sobre los iconos:** es importante reasignar permisos de lectura (`chmod -R a+rX`) después de copiar. Si no, Nginx no puede acceder a las fuentes de iconos (`.woff2`) y estos aparecen como cuadros.

> En el repositorio se incluye `deploy.ps1` (y `deploy.bat`), que automatiza build + limpieza + copia + permisos en un solo comando.

### Despliegue del backend

El backend se actualiza desde el repositorio en el servidor y se reinicia con PM2:

```bash
cd /var/www/Citas_Medicas
git pull origin main

# Si PM2 ya está configurado
pm2 restart mi-api-medico
```

Si es la primera vez, inicia el proceso con:

```bash
cd /var/www/Citas_Medicas/Backend
npm install
pm2 start index.js --name mi-api-medico
pm2 save
```

---

## Endpoints de la API

Base URL (entorno local): `http://localhost:3000/api`

### Autenticación

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/auth/registro` | Registrar un usuario | Público |
| POST | `/auth/login` | Iniciar sesión | Público |
| GET | `/auth/me` | Obtener el perfil del usuario logueado | Autenticado |
| PUT | `/auth/perfil` | Actualizar perfil propio | Autenticado |
| GET | `/auth/usuarios` | Listar usuarios | Administrador |
| DELETE | `/auth/usuarios/:id` | Eliminar un usuario y sus datos asociados | Administrador |

### Pacientes

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/pacientes` | Crear paciente | Administrador |
| GET | `/pacientes` | Listar pacientes | Autenticado |
| DELETE | `/pacientes/:id` | Eliminar un paciente y sus datos | Administrador |

### Médicos

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/medicos` | Crear médico | Administrador |
| GET | `/medicos` | Listar médicos | Público |
| PUT | `/medicos/:id/disponibilidad` | Configurar días, horas y bloqueos del médico | Administrador |
| DELETE | `/medicos/:id` | Eliminar un médico y sus datos | Administrador |

### Citas

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/citas` | Crear una cita | Autenticado |
| POST | `/citas/asignar` | Asignar cita automática | Autenticado |
| POST | `/citas/asignar-rapido` | Asignación rápida para pacientes | Autenticado |
| GET | `/citas` | Listar citas (filtrando por rol) | Autenticado |
| GET | `/citas/agenda` | Agenda del médico logueado | Médico |
| GET | `/citas/medico/:medicoId` | Citas de un médico | Autenticado |
| GET | `/citas/disponibles/:medicoId` | Cupos disponibles por médico | Autenticado |
| GET | `/citas/disponibles/:medicoId/:fecha` | Horas libres de un médico en una fecha | Autenticado |
| GET | `/citas/disponibilidad/:medicoId` | Disponibilidad por rango (para el calendario mensual) | Autenticado |
| PATCH | `/citas/:id` | Actualizar una cita | Autenticado |
| DELETE | `/citas/:id` | Eliminar una cita | Autenticado |

### Auditoría

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/audit` | Listar logs (resumen o detallado por filtros) | Administrador |

### Reportes

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/reportes/citas-por-mes` | Citas confirmadas/atendidas por mes | Administrador |
| GET | `/reportes/pacientes-frecuentes` | Pacientes con más citas | Administrador |

---

## Roles y permisos

| Rol | Puede ver | Puede crear | Puede editar/eliminar |
|-----|-----------|-------------|----------------------|
| Administrador | Todo, Auditoría, Reportes | Pacientes, médicos, usuarios, citas | Todo |
| Médico | Citas asignadas (agenda) | Citas | Citas |
| Paciente | Solo sus citas | Citas | Cancela sus propias citas |

Disponibilidad de médicos (días, horas y bloqueos por vacaciones/licencia) y auditoría están restringidos al rol Administrador. El Centro de Ayuda está disponible para los tres roles.

---

## Mejoras futuras

La aplicación cuenta con una base sólida, pero por el alcance actual quedan varias funcionalidades pendientes que se pueden incorporar en una siguiente etapa:

### Asistencia al paciente
- **Chat bot de ayuda**: un asistente conversacional que responda dudas frecuentes de los pacientes (agendar, cancelar, estados de la cita) y agilice la atención, reduciendo la dependencia del administrador.
- **Recuperación de contraseña**: restablecer la contraseña por correo electrónico (enlace o código de verificación) cuando el usuario la olvide, en lugar de depender del administrador.
- **Notificaciones y recordatorios**: avisos por correo o WhatsApp antes de la cita y confirmación de cambios de estado.

### Gestión de médicos y citas
- **Selección de médico por especialidad**: asignar una especialidad a cada médico y permitir a los pacientes filtrar y agendar según la especialidad que necesiten.
- **Historial clínico del paciente**: registrar diagnósticos y notas de las consultas atendidas, visibles para el médico y el administrador.
- **Reprogramación automática**: al bloquear días de un médico, ofrecer al paciente la opción de mover automáticamente su cita a otro día disponible.

### Plataforma
- **Video consulta / telemedicina**: agenda con encuentros remotos por videollamada.
- **Exportación de reportes**: descargar reportes en PDF o Excel.
- **Multi-sede y multi-horario**: definir sedes para cada médico con horarios propios.
- **Aplicación móvil**: versión para Android/iOS o PWA para mejorar la experiencia de los pacientes.

---

## Autor

**Luisa Fernanda Cárdenas Sierra**

Desarrollado como proyecto final — Bootcamp Desarrollo de Software.
