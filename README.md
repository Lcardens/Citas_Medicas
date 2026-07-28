# Sistema de Citas Médicas

Aplicación web fullstack para la gestión integral de citas médicas. Permite a pacientes, médicos y administradores agendar, asignar y administrar citas médicas de forma centralizada.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 22, TypeScript 6, Bootstrap 5 |
| Backend | Node.js 18+, Express 5 |
| Base de datos | MongoDB (Mongoose 9) |
| Autenticación | JWT (JSON Web Tokens) + bcryptjs |
| Herramientas | Nodemon, Vitest, Prettier |

## Funcionalidades

### Autenticación y roles
- Registro de usuarios con roles: **admin**, **médico**, **paciente**
- Login con JWT y token en localStorage
- Middleware de protección de rutas y autorización por roles
- Al registrar un paciente o médico, se crea automáticamente su perfil en la colección correspondiente

### Gestión de pacientes (admin)
- Crear pacientes con tipo de documento, documento, nombre, correo y teléfono
- Listar todos los pacientes registrados

### Gestión de médicos (admin)
- Crear médicos con registro médico y nombre
- Al crear un médico se generan automáticamente 10 cupos diarios (8:00 AM a 6:00 PM)
- Listar todos los médicos registrados

### Gestión de citas médicas
- **Crear cita**: asignar paciente, médico, fecha, hora y motivo
- **Asignar cita automática**: sistema asigna el próximo cupo disponible
- **Listar citas**: filtrado automático por rol (pacientes solo ven las suyas)
- **Actualizar cita**: modificar motivo y estado (Disponible, Confirmada, Cancelada)
- **Eliminar cita**
- **Filtrar por médico**: barra de filtro en la vista de citas

### Relación usuario-paciente
- Los usuarios se relacionan con los pacientes mediante el correo electrónico
- Si un paciente no existe en la colección `pacientes`, se crea automáticamente al listar citas

## Estructura del proyecto

```
Proyecto_Final/
├── Backend/
│   ├── config/
│   │   └── db.js                    # Conexión a MongoDB
│   ├── controllers/
│   │   ├── authController.js        # Registro / Login / auto-crea Paciente/Médico
│   │   ├── citaController.js        # CRUD de citas + asignación automática
│   │   ├── medicoController.js      # CRUD de médicos + cupos iniciales
│   │   └── pacienteController.js    # CRUD de pacientes
│   ├── middleware/
│   │   └── auth.js                  # proteger (JWT) + autorizar (roles)
│   ├── models/
│   │   ├── User.js                  # Modelo de usuario (auth)
│   │   ├── cita.js                  # Modelo de cita (ref: Paciente, Medico)
│   │   ├── medico.js                # Modelo de médico
│   │   └── Paciente.js              # Modelo de paciente
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── citaRoutes.js            # /api/citas/*
│   │   ├── medicoRoutes.js          # /api/medicos/*
│   │   └── pacienteRoutes.js        # /api/pacientes/*
│   ├── index.js                     # Punto de entrada
│   ├── peticiones.rest              # Peticiones de prueba (REST Client)
│   ├── .env                         # Variables de entorno
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   ├── admin.guard.ts
│   │   │   │   │   └── role.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── cita.service.ts
│   │   │   │       ├── medico.service.ts
│   │   │   │       ├── paciente.service.ts
│   │   │   │       └── usuario.service.ts
│   │   │   ├── pages/
│   │   │   │   ├── login/           # Login + Registro
│   │   │   │   ├── dashboard/       # Layout con navbar
│   │   │   │   ├── inicio/          # Página de bienvenida
│   │   │   │   ├── pacientes/       # CRUD de pacientes
│   │   │   │   ├── medicos/         # CRUD de médicos
│   │   │   │   ├── citas/           # Gestión de citas
│   │   │   │   └── usuarios/        # Lista de usuarios
│   │   │   ├── app.config.ts        # Providers (router + interceptor)
│   │   │   └── app.routes.ts        # Rutas con guards
│   │   └── environments/
│   │       ├── environment.ts           # Producción
│   │       └── environment.development.ts # Desarrollo
│   ├── proxy.conf.json              # Proxy API → Backend
│   ├── angular.json
│   └── package.json
│
└── README.md
```

## Configuración del entorno

Crea el archivo `Backend/.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?appName=AppCitas
PORT=3000
JWT_SECRET=una_clave_segura_y_larga
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

## Instalación y ejecución

### 1. Backend

```bash
cd Backend
npm install
npm run dev
```

El servidor arranca en `http://localhost:3000`.

### 2. Frontend

```bash
cd Frontend
npm install
npm start
```

La aplicación Angular arranca en `http://localhost:4200`. Todas las peticiones `/api/*` se proxean automáticamente al backend mediante `proxy.conf.json`.

## Endpoints de la API

Base URL: `http://localhost:3000/api`

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/registro` | Registrar usuario (+ auto-crea Paciente/Médico) | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/usuarios` | Listar usuarios | Admin |

### Pacientes

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/pacientes` | Crear paciente | Admin |
| GET | `/pacientes` | Listar pacientes | Autenticado |

### Médicos

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/medicos` | Crear médico (+ 10 cupos diarios) | Admin |
| GET | `/medicos` | Listar médicos | Público |

### Citas

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/citas` | Crear cita | Autenticado |
| POST | `/citas/asignar` | Asignar cita automática | Autenticado |
| GET | `/citas` | Listar citas (filtrado por rol) | Autenticado |
| GET | `/citas/medico/:medicoId` | Citas por médico | Autenticado |
| GET | `/citas/disponibles/:medicoId` | Citas disponibles por médico | Autenticado |
| PATCH | `/citas/:id` | Actualizar cita | Autenticado |
| DELETE | `/citas/:id` | Eliminar cita | Autenticado |

## Roles y permisos

| Rol | Puede ver | Puede crear | Puede editar/eliminar |
|-----|-----------|-------------|----------------------|
| Admin | Todo | Pacientes, médicos, citas | Todo |
| Médico | Citas asignadas | Citas | Citas |
| Paciente | Solo sus citas | — | — |

## Pruebas con REST Client

El archivo `Backend/peticiones.rest` contiene peticiones listas para probar con la extensión **REST Client** de VS Code.

## Autor

Luisa Fernanda Cárdenas Sierra

Desarrollado como proyecto final — Bootcamp Desarrollo de Software.
