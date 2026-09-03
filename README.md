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
- [Autor](#autor)

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular, TypeScript, Bootstrap 5 |
| Backend | Node.js, Express |
| Base de datos | MongoDB Atlas (Mongoose) |
| Autenticación | JWT + bcryptjs |
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
- Al crear un médico se generan automáticamente sus cupos diarios de atención.
- Eliminar médicos con borrado en cascada de datos asociados.

### Gestión de usuarios (administrador)
- Listar todos los usuarios del sistema.
- Eliminar usuarios con borrado en cascada de datos asociados.

### Gestión de citas médicas
- **Agendar cita**: el paciente elige médico, fecha y hora entre los cupos realmente disponibles.
- **Asignación automática**: el sistema asigna el próximo cupo disponible.
- **Asignación rápida**: el propio paciente solicita que el sistema le asigne automáticamente el primer médico con disponibilidad.
- **Cancelación**: los pacientes pueden cancelar sus propias citas.
- **Estados de cita**: Confirmada, Disponible, Atendida (con diagnóstico) y Cancelada, diferenciadas con colores.
- **Agenda del médico**: vista de turnos propia para el médico logueado.
- **Filtros por columna**: la tabla de citas permite filtrar por médico, estado y fecha (estilo filtros de Excel), con botón para limpiar. Los pacientes solo ven sus propias citas.

### Disponibilidad de citas
- El sistema genera cupos de forma automática y devuelve únicamente las horas libres para un médico y una fecha concretos.
- Las horas ya vencidas del día actual se descartan.
- **Calendario mensual**: al agendar una cita se muestra un calendario del mes que consulta la disponibilidad por rango de fechas y resalta los días sin cupos disponibles como bloqueados (no seleccionables); el día actual se marca y la selección de fecha queda resaltada.

### Reportes (administrador)
- **Citas por mes**: total de citas confirmadas/atendidas agrupadas por mes.
- **Pacientes frecuentes**: pacientes con más citas confirmadas/atendidas.

---

## Estructura del proyecto

```
Proyecto_Final/
├── Backend/
│   ├── config/
│   │   └── db.js                    # Conexión a MongoDB
│   ├── controllers/
│   │   ├── authController.js        # Registro, login, perfil propio, usuarios
│   │   ├── citaController.js        # CRUD de citas, asignación y disponibilidad
│   │   ├── medicoController.js      # CRUD de médicos y generación de cupos
│   │   ├── pacienteController.js    # CRUD de pacientes
│   │   └── reporteController.js     # Reportes (citas por mes, pacientes frecuentes)
│   ├── middleware/
│   │   └── auth.js                  # Protección (JWT) y autorización por roles
│   ├── models/
│   │   ├── user.js                  # Usuario de autenticación
│   │   ├── cita.js                  # Cita (referencia a Paciente y Medico)
│   │   ├── medico.js                # Médico
│   │   └── Paciente.js              # Paciente
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
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
│   │       │   ├── medicos/         # Gestión de médicos
│   │       │   ├── usuarios/        # Lista de usuarios
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
| POST | `/medicos` | Crear médico y generar cupos | Administrador |
| GET | `/medicos` | Listar médicos | Público |
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

### Reportes

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/reportes/citas-por-mes` | Citas confirmadas/atendidas por mes | Administrador |
| GET | `/reportes/pacientes-frecuentes` | Pacientes con más citas | Administrador |

---

## Roles y permisos

| Rol | Puede ver | Puede crear | Puede editar/eliminar |
|-----|-----------|-------------|----------------------|
| Administrador | Todo | Pacientes, médicos, citas | Todo |
| Médico | Citas asignadas (agenda) | Citas | Citas |
| Paciente | Solo sus citas | Citas | Cancela sus propias citas |

---

## Autor

**Luisa Fernanda Cárdenas Sierra**

Desarrollado como proyecto final — Bootcamp Desarrollo de Software.
