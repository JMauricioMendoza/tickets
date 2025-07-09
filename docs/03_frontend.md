# Frontend – Plataforma de Gestión de Incidencias

Este archivo documenta la estructura general del frontend, su comunicación con el backend, las dependencias clave utilizadas y las buenas prácticas adoptadas en el desarrollo del proyecto.

---

## 📁 Estructura de carpetas

El proyecto sigue una estructura sencilla y funcional:


- **`components/`**: Componentes reutilizables.
- **`pages/`**: Vistas principales del sistema, divididas por funcionalidades.
- **`utils/`**: Funciones reutilizables, validaciones y manejo de rutas protegidas.

---

## 🔗 Comunicación con el backend

La comunicación con el backend se realiza exclusivamente mediante **fetch** con intercambio de datos en formato **JSON**.

Para facilitar la reutilización y evitar código duplicado, se usan dos archivos utilitarios:

- **`enviarDatos.js`**: Para peticiones tipo `POST`, `PATCH`, `DELETE`.
- **`obtenerDatos.js`**: Para peticiones `GET`.

Ambos manejan headers, parsing de respuestas, y lógica de token de autenticación:

```js
const token = sessionStorage.getItem("token");
if (token) {
  headers.Authorization = `Bearer ${token}`;
}
```

El token se guarda en `sessionStorage` y se incluye automáticamente en las solicitudes autenticadas.

---

## ⚙️ Dependencias clave

El frontend utiliza las siguientes herramientas y librerías:

- **React Router:** Para manejo de rutas y navegación.
- **Tailwind CSS:** Utilizado como sistema principal de estilos.
- **HeroUI:** Colección de componentes de UI reutilizables.
- **React Icons:** Para Íconos SVG.
- **ESLint:** Reglas de linting con `eslint-config-airbnb`.
- **Prettier:** Para formateo automático de código (`eslint-config-prettier`).

---

## ✅ Buenas prácticas

- **Modularidad:** Se busca mantener la lógica reutilizable en la carpeta `utils/` para facilitar mantenimiento y lectura.
- **Validaciones:** Se realizan manualmente; no hay un estándar formal, pero se intenta mantener consistencia.
- **Manejo de errores:**
  - Si ocurre un error tipo `500`, se muestra un mensaje genérico al usuario.
  - Para otros códigos (como errores de validación), se muestra el mensaje devuelto por el backend.
  - Se usa un componente de tipo **modal** para mostrar estos mensajes.
- **Limpieza de código:** Se utiliza ESLint y Prettier de forma estricta para mantener consistencia en el estilo del código.