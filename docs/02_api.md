# API – Plataforma de Gestión de Incidencias

Este documento describe los endpoints disponibles en la API del sistema, los métodos HTTP que utilizan, el esquema de autenticación y el formato general de las respuestas.

---

## 🔐 Autenticación

La API utiliza un **token personalizado** (UUID) para autenticación. Al iniciar sesión exitosamente, el backend genera un token que se almacena en la tabla `sesion` junto con el `usuario_id` y la fecha de expiración.

El token debe ser enviado en cada solicitud autenticada a través de los **headers**. Se recomienda almacenarlo en el `sessionStorage` del cliente.

Existen dos niveles de acceso:

- **Sin autenticación**: para usuarios que reportan incidencias (levantamiento de ticket).
- **Usuario autenticado**: personal técnico con acceso a funciones de seguimiento y actualización.
- **Administrador**: usuario con acceso a la gestión de catálogos, usuarios y configuraciones administrativas.

---

## 🔓 Endpoints públicos (sin autenticación)

| Método | Endpoint                     | Descripción                       | Códigos de respuesta posibles     |
|--------|------------------------------|-----------------------------------|-----------------------------------|
| POST   | `/IniciarSesion`             | Inicia sesión y devuelve el token | `200`, `400`, `401`, `500`        |
| DELETE | `/CerrarSesion/:usuario_id`  | Cierra sesión del usuario         | `200`, `400`, `500`               |
| POST   | `/CrearTicket`               | Levanta un nuevo ticket           | `201`, `400`, `500`               |
| GET    | `/ObtenerTipoTicketsActivos` | Obtiene tipos de tickets activos  | `200`, `500`                      |
| GET    | `/ObtenerAreasActivos`       | Obtiene áreas activas             | `200`, `500`                      |

---

## 🔐 Endpoints con autenticación (usuario técnico)

| Método | Endpoint                        | Descripción                                                   | Códigos de respuesta posibles     |
|--------|---------------------------------|---------------------------------------------------------------|-----------------------------------|
| GET    | `/ObtenerTickets`               | Lista todos los tickets visibles para el usuario que consulta | `200`, `401`, `500`               |
| GET    | `/ObtenerTicketPorID/:id`       | Obtiene información de un ticket específico                   | `200`, `401`, `404`               |
| PATCH  | `/ActualizarTicket`             | Actualiza información de un ticket                            | `200`, `400`, `401`, `403`, `500` |
| GET    | `/ObtenerEstatusTicketsActivos` | Lista estatus de tickets activos                              | `200`, `401`, `500`               |
| PATCH  | `/CambiarPassword`              | Permite al usuario cambiar una contraseña                     | `200`, `400`, `401`, `500`        |
| GET    | `/VerificaSesion`               | Verifica si el token de sesión sigue activo                   | `200`, `401`, `500`               |

---

## ⚙️ Endpoints con autenticación de administrador

| Método | Endpoint                          | Descripción                         | Códigos de respuesta posibles     |
|--------|-----------------------------------|-------------------------------------|-----------------------------------|
| GET    | `/ObtenerEstatusTickets`          | Lista todos los estatus de tickets  | `200`, `401`, `500`               |
| GET    | `/ObtenerEstatusTicketsPorID/:id` | Obtiene un estatus de ticket por ID | `200`, `401`, `404`               |
| PATCH  | `/ActualizarEstatusTicket`        | Actualiza un estatus de ticket      | `200`, `400`, `401`, `500`        |
| POST   | `/CrearEstatusTicket`             | Crea un nuevo estatus de ticket     | `201`, `400`, `401`, `500`        |
| GET    | `/ObtenerUsuariosActivos`         | Lista todos los usuarios activos    | `200`, `401`, `500`               |
| GET    | `/ObtenerUsuariosInactivos`       | Lista todos los usuarios inactivos  | `200`, `401`, `500`               |
| GET    | `/ObtenerUsuarioPorID/:id`        | Obtiene datos de un usuario por ID  | `200`, `401`, `404`, `500`        |
| POST   | `/CrearUsuario`                   | Crea un nuevo usuario               | `201`, `400`, `401`, `409`, `500` |
| PATCH  | `/InhabilitarUsuario`             | Inactiva un usuario                 | `200`, `400`, `401`, `500`        |
| PATCH  | `/HabilitarUsuario`               | Reactiva un usuario                 | `200`, `400`, `401`, `500`        |
| PATCH  | `/ActualizarUsuario`              | Actualiza datos de un usuario       | `200`, `400`, `401`, `500`        |
| GET    | `/ObtenerAreas`                   | Lista todas las áreas               | `200`, `401`, `500`               |
| POST   | `/CrearArea`                      | Crea una nueva área                 | `201`, `400`, `401`, `500`        |
| GET    | `/ObtenerAreaPorID/:id`           | Obtiene un área por ID              | `200`, `401`, `404`               |
| PATCH  | `/ActualizarArea`                 | Actualiza información de un área    | `200`, `400`, `401`, `500`        |
| GET    | `/ObtenerTipoTickets`             | Lista todos los tipos de tickets    | `200`, `401`, `500`               |
| GET    | `/ObtenerTipoTicketPorID/:id`     | Obtiene tipo de ticket por ID       | `200`, `401`, `404`               |
| PATCH  | `/ActualizarTipoTicket`           | Actualiza tipo de ticket            | `200`, `400`, `401`, `500`        |
| POST   | `/CrearTipoTicket`                | Crea un nuevo tipo de ticket        | `201`, `400`, `401`, `500`        |

---

## 📄 Formato de respuesta

Todas las respuestas de la API tienen formato **JSON** y mantienen una estructura consistente:

```json
{
  "mensaje": "Texto descriptivo del resultado",
  "datos": { ... } // opcional, dependiendo del tipo de respuesta
}
