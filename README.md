# API de Gestión Médica

API REST para la gestión de **pacientes**, **médicos** y **citas**, construida con **Node.js**, **Express** y **MongoDB** (Mongoose).

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración del entorno (.env)](#configuración-del-entorno-env)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Modelos de datos](#modelos-de-datos)
- [Endpoints](#endpoints)
  - [Pacientes](#pacientes)
  - [Médicos](#médicos)
  - [Citas](#citas)
- [Pruebas con REST Client (VS Code)](#pruebas-con-rest-client-vs-code)
- [Scripts disponibles](#scripts-disponibles)

## Tecnologías

- **Node.js** — entorno de ejecución
- **Express 5** — framework HTTP
- **Mongoose 9** — ODM para MongoDB
- **MongoDB Atlas** — base de datos en la nube
- **dotenv** — manejo de variables de entorno
- **nodemon** — recarga automática en desarrollo

## Estructura del proyecto

```
Backend/
├── config/
│   └── db.js                  # Conexión a MongoDB
├── controllers/
│   ├── citaController.js      # Lógica de citas
│   ├── medicoController.js    # Lógica de médicos
│   └── pacienteController.js  # Lógica de pacientes
├── models/
│   ├── cita.js                # Esquema de Cita
│   ├── medico.js              # Esquema de Médico
│   └── Paciente.js            # Esquema de Paciente
├── routes/
│   ├── citaRoutes.js          # Rutas de citas
│   ├── medicoRoutes.js        # Rutas de médicos
│   └── pacienteRoutes.js      # Rutas de pacientes
├── index.js                   # Punto de entrada
├── peticiones.rest            # Peticiones de prueba (REST Client)
├── .env                       # Variables de entorno (NO se versiona)
└── package.json
```

## Configuración del entorno (.env)

> ⚠️ **Importante:** crea el archivo `Backend/.env` antes de iniciar el proyecto. **Este archivo está en `.gitignore` y no se sube al repositorio**, por lo que cada desarrollador debe crearlo localmente.

Crea el archivo `Backend/.env` con el siguiente contenido:

```env
MONGODB_URI=tu_uri_de_mongodb
PORT=3000
```

### ¿Dónde conseguir la `MONGODB_URI`?

1. Entra a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y crea una cuenta (o inicia sesión).
2. Crea un **cluster gratuito** (Free Tier / M0).
3. En **Database Access**, crea un usuario y contraseña.
4. En **Network Access**, agrega tu IP (o `0.0.0.0/0` para permitir acceso desde cualquier lugar — solo para desarrollo).
5. En **Database Deployments → Connect → Drivers**, copia la URI de conexión.
6. Reemplaza `<username>` y `<password>` por tus credenciales.

Ejemplo de URI:

```
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/nombreBD?retryWrites=true&w=majority
```

> 🔐 **Nunca** subas el archivo `.env` a un repositorio. Contiene credenciales sensibles.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Segundo_Modulo/Backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo `.env`

Sigue las instrucciones de la sección [Configuración del entorno](#configuración-del-entorno-env).

### 4. Ejecutar el servidor

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

Verás en consola:

```
✅ MongoDB conectada: <host>
🚀 Servidor escuchando en puerto 3000
```

### 5. Probar que funciona

Abre en el navegador o en REST Client:

```
GET http://localhost:3000/
```

Respuesta esperada:

```json
{ "mensaje": "¡API funcionando!" }
```

## Modelos de datos

### Paciente

| Campo           | Tipo   | Requerido | Notas                               |
| --------------- | ------ | --------- | ----------------------------------- |
| `TipoDocumento` | String | ✅        | enum: `CC`, `TI`, `CE`, `Pasaporte` |
| `Documento`     | String | ✅        | único                               |
| `Nombre`        | String | ✅        |                                     |
| `Correo`        | String | ✅        | se guarda en minúsculas             |
| `Telefono`      | String | ✅        |                                     |

### Médico

| Campo            | Tipo   | Requerido | Notas |
| ---------------- | ------ | --------- | ----- |
| `Registromedico` | String | ✅        |       |
| `Nombre`         | String | ✅        |       |

### Cita

| Campo           | Tipo     | Requerido | Notas                                                          |
| --------------- | -------- | --------- | -------------------------------------------------------------- |
| `medico`        | ObjectId | ✅        | referencia a `Medico`                                          |
| `paciente`      | ObjectId | ❌        | referencia a `Paciente`                                        |
| `fecha`         | Date     | ✅        |                                                                |
| `motivo`        | String   | ✅        |                                                                |
| `estado`        | String   | ❌        | `Pendiente` (default), `Confirmada`, `Cancelada`, `Completada` |
| `observaciones` | String   | ❌        |                                                                |

## Endpoints

Base URL: `http://localhost:3000`

### Pacientes

| Método | Ruta             | Descripción                |
| ------ | ---------------- | -------------------------- |
| `POST` | `/api/pacientes` | Crear un paciente          |
| `GET`  | `/api/pacientes` | Listar todos los pacientes |

**Ejemplo — Crear paciente**

```http
POST /api/pacientes
Content-Type: application/json

{
  "TipoDocumento": "CC",
  "Documento": "123456789",
  "Nombre": "Philip",
  "Correo": "philipe-dev@email.com",
  "Telefono": "1234567890"
}
```

### Médicos

| Método | Ruta           | Descripción              |
| ------ | -------------- | ------------------------ |
| `POST` | `/api/medicos` | Crear un médico          |
| `GET`  | `/api/medicos` | Listar todos los médicos |

**Ejemplo — Crear médico**

```http
POST /api/medicos
Content-Type: application/json

{
  "Registromedico": "123456",
  "Nombre": "Luisa"
}
```

### Citas

| Método   | Ruta                 | Descripción                                                  |
| -------- | -------------------- | ------------------------------------------------------------ |
| `POST`   | `/api/citas`         | Crear una cita (sin paciente)                                |
| `PATCH`  | `/api/citas/asignar` | Asignar paciente a una cita                                  |
| `GET`    | `/api/citas`         | Listar todas las citas (con `populate` de paciente y médico) |
| `DELETE` | `/api/citas/:id`     | Eliminar una cita por ID                                     |

**Ejemplo — Crear cita**

```http
POST /api/citas
Content-Type: application/json

{
  "medico": "665a1b2c3d4e5f6a7b8c9d0e",
  "fecha": "2024-07-01",
  "motivo": "Consulta general"
}
```

**Ejemplo — Asignar cita a un paciente**

```http
PATCH /api/citas/asignar
Content-Type: application/json

{
  "citaId": "665a...",
  "pacienteId": "665a..."
}
```

**Ejemplo — Eliminar cita**

```http
DELETE /api/citas/665a1b2c3d4e5f6a7b8c9d0e
```

## Pruebas con REST Client (VS Code)

Este proyecto incluye el archivo **`Backend/peticiones.rest`** con todas las peticiones listas para ejecutarse desde VS Code usando la extensión **REST Client**.

### Instalación de la extensión

1. Abre VS Code.
2. Ve a la pestaña de **Extensiones** (`Ctrl+Shift+X`).
3. Busca **REST Client** (autor: Huachao Mao).
4. Haz clic en **Install**.

### Cómo usar las peticiones

1. Abre el archivo `Backend/peticiones.rest` en VS Code.
2. Verás cada petición como un bloque separado por `###`.
3. Sobre cada petición aparece el enlace **"Send Request"** — haz clic para ejecutarla.
4. La respuesta se mostrará en un panel lateral.

### Encadenar peticiones con variables

REST Client permite reutilizar respuestas entre peticiones usando la sintaxis `{{nombre.response.body.campo}}`. El archivo `peticiones.rest` ya viene configurado así:

```http
# Lista los médicos y guarda la respuesta como "lista_de_medicos"
# @name lista_de_medicos
GET http://localhost:3000/api/medicos

###
# Usa el ID del primer médico de la respuesta anterior
POST http://localhost:3000/api/citas
Content-Type: application/json

{
  "medico": "{{lista_de_medicos.response.body.datos.[0]._id}}",
  "fecha": "2024-07-01",
  "motivo": "Consulta general"
}
```

### Flujo de prueba sugerido

Ejecuta las peticiones en este orden para evitar errores de referencias:

1. **Crear pacientes** (`POST /api/pacientes`) — 1 o 2 veces.
2. **Crear médicos** (`POST /api/medicos`) — 1 o 2 veces.
3. **Listar pacientes** (`GET /api/pacientes`) — para obtener sus IDs.
4. **Listar médicos** (`GET /api/medicos`) — para obtener sus IDs.
5. **Crear cita** (`POST /api/citas`) — usando un `medico` válido.
6. **Asignar cita** (`PATCH /api/citas/asignar`) — usando `citaId` y `pacienteId`.
7. **Listar citas** (`GET /api/citas`) — para ver la cita con sus referencias pobladas.
8. **Eliminar cita** (`DELETE /api/citas/:id`) — usando un ID real.

> 💡 **Tip:** si cambias el puerto en `.env`, actualiza también la URL en `peticiones.rest`.

## Scripts disponibles

| Script  | Comando            | Descripción                               |
| ------- | ------------------ | ----------------------------------------- |
| `dev`   | `nodemon index.js` | Inicia el servidor con recarga automática |
| `start` | `node index.js`    | Inicia el servidor en modo producción     |

---

## Autor

Luisa Fernanda Cárdenas Sierra

Desarrollado como proyecto de aprendizaje — Bootcamp Módulo 2.
