# Sistema de Gestión Médica (Fullstack)

Proyecto fullstack para la gestión de pacientes, médicos y citas. Incluye:

- Backend: Node.js, Express y MongoDB (Mongoose).
- Frontend: aplicación Angular que consume la API.

Este README resume las funcionalidades implementadas (incluida la autenticación), la estructura del proyecto y los pasos para ejecutar localmente ambas partes.

## Tabla de contenidos

- [¿Qué incluye este repo?](#qué-incluye-este-repo)
- [Cambios y funcionalidades añadidas](#cambios-y-funcionalidades-añadidas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración del entorno](#configuración-del-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Resumen de endpoints principales](#resumen-de-endpoints-principales)
- [Pruebas con REST Client (VS Code)](#pruebas-con-rest-client-vs-code)
- [Autor](#autor)

## ¿Qué incluye este repo?

- Backend: API REST con rutas para `pacientes`, `medicos`, `citas` y `auth`.
- Frontend: SPA con rutas de `login`, `dashboard`, páginas para `pacientes`, `medicos` y `citas`.

## Cambios y funcionalidades añadidas

- Autenticación JWT en el backend: registro (`POST /api/auth/registro`) y login (`POST /api/auth/login`).
- Modelo `User` con hash de contraseñas y roles (`usuario`, `admin`).
- Middleware de protección de rutas (`proteger`) y autorización por roles (`autorizar`).
- Rutas de `auth` integradas en el servidor (`/api/auth`).
- En el frontend:
  - `AuthService` para login, manejo de token en `localStorage` y estado de autenticación.
  - `authInterceptor` que adjunta `Authorization: Bearer <token>` a las peticiones HTTP.
  - `authGuard` para proteger rutas de la aplicación Angular.
- Archivo de peticiones para pruebas: `Backend/peticiones.rest`.

## Estructura del proyecto

```
Backend/
├── config/
│   └── db.js                  # Conexión a MongoDB
├── controllers/
│   ├── authController.js      # Registro / Login (JWT)
│   ├── citaController.js      # Lógica de citas
│   ├── medicoController.js    # Lógica de médicos
│   └── pacienteController.js  # Lógica de pacientes
├── middleware/
│   └── auth.js                # proteger + autorizar (roles)
├── models/
│   ├── User.js                # Modelo de usuario (auth)
│   ├── cita.js                # Esquema de Cita
│   ├── medico.js              # Esquema de Médico
│   └── Paciente.js            # Esquema de Paciente
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── citaRoutes.js          # /api/citas
│   ├── medicoRoutes.js        # /api/medicos
│   └── pacienteRoutes.js      # /api/pacientes
├── index.js                   # Punto de entrada (registra rutas y middlewares)
├── peticiones.rest            # Peticiones de prueba (REST Client)
└── package.json

Frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/        # auth.guard.ts
│   │   │   ├── interceptors/  # auth.interceptor.ts
│   │   │   └── services/      # auth.service.ts, cita.service.ts, etc.
│   │   ├── pages/             # vistas: login, dashboard, medicos, pacientes, citas
│   │   └── app.routes.ts
│   └── environments/          # environment.ts / environment.development.ts
├── angular.json
└── package.json
```

## Configuración del entorno

Backend: crea `Backend/.env` con al menos:

```env
MONGODB_URI=tu_uri_de_mongodb
PORT=3000
JWT_SECRET=una_clave_segura
JWT_EXPIRES_IN=8h
```

Frontend: el `environment.development.ts` ya apunta a la API en `http://localhost:3000/api`. Si cambias el puerto o la URL, actualiza `Frontend/src/environments/*`.

## Instalación y ejecución

Sigue estos pasos para ejecutar la aplicación completa en local.

1. Backend

```bash
cd Backend
npm install
# Crear Backend/.env (ver sección anterior)
npm run dev   # o `npm start` para producción
```

2. Frontend

```bash
cd Frontend
npm install
npm start
```

Accede a la app Angular en `http://localhost:4200` (por defecto) y la API en `http://localhost:3000`.

## Resumen de endpoints principales

Base URL del API: `http://localhost:3000/api`

- Auth
  - `POST /auth/registro` — Registrar usuario (devuelve `token`).
  - `POST /auth/login` — Iniciar sesión (devuelve `token`).

- Pacientes
  - `POST /pacientes` — Crear paciente.
  - `GET /pacientes` — Listar pacientes.

- Médicos
  - `POST /medicos` — Crear médico.
  - `GET /medicos` — Listar médicos.

- Citas
  - `POST /citas` — Crear cita (requiere `medico` válido).
  - `PATCH /citas/asignar` — Asignar paciente a cita.
  - `GET /citas` — Listar citas (populates `medico` y `paciente`).
  - `DELETE /citas/:id` — Eliminar cita por ID.

Protección: las rutas que requieran autenticación usan el header `Authorization: Bearer <token>`; el frontend añade automáticamente este header mediante `authInterceptor`.

## Pruebas con REST Client (VS Code)

El archivo `Backend/peticiones.rest` contiene un conjunto de peticiones listas para ejecutar con la extensión **REST Client**. Úsalas para probar flujo: crear médicos/pacientes → crear cita → asignar cita.

## Notas y recomendaciones

- El `User` model cifra contraseñas con `bcrypt` y expone un método `compararPassword`.
- El middleware `proteger` valida el JWT y adjunta `req.usuario` para control de permisos.
- El frontend guarda el token en `localStorage` y usa `authGuard` para proteger rutas UI.

Si quieres que añada en el README ejemplos concretos de peticiones `curl` o que actualice `peticiones.rest` con nuevas pruebas, dímelo y lo añado.

---

## Autor

Luisa Fernanda Cárdenas Sierra

Desarrollado como proyecto de aprendizaje — Bootcamp Proyecto Final.
