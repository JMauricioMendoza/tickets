# Instalación y ejecución del sistema – Plataforma de Gestión de Incidencias

Este documento describe cómo levantar el sistema tanto en entorno de desarrollo como en producción. El sistema consta de un backend en Go (usando el framework Gin) y un frontend en React (Create React App). Los archivos estáticos del frontend son servidos directamente por el backend en producción.

---

## 📦 Requisitos del sistema

Antes de continuar, asegúrate de tener instalado lo siguiente:

- [Go 1.24.0](https://go.dev/dl/)
- [Node.js v22.13.0 y npm](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org/) (versión compatible con tu configuración local)

---

## ⚙️ Variables de entorno

### Backend (`.env`)

Crea un archivo `.env` en el mismo directorio que el binario del backend con el siguiente contenido:

```
PORT=8080
DB_HOST=ip_base_datos
DB_PORT=5432
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_base_datos
TELEGRAM_TOKEN=token_de_bot
TELEGRAM_CHAT_ID=id_del_chat
```

### Frontend

El frontend requiere una sola variable de entorno:

```
REACT_APP_API_URL=http://localhost:8080
```

> ⚠️ Asegúrate de reemplazar `localhost:8080` por el host correspondiente en producción.

---

## 🛠️ Ejecución en desarrollo

### Backend

Desde la carpeta `be`, ejecuta:

```bash
go run main.go
```


### Frontend

Desde la carpeta `fe`, instala las dependencias y ejecuta el servidor de desarrollo:

```bash
npm install
npm start
```
---

## 🚀 Ejecución en producción

### Estructura de carpetas esperada

La estructura de archivos esperada para producción es la siguiente:

```
<carpeta_donde_ira_el_binario>
│   .env
│   tickets-app.exe (binario de Go)
│
└───fe
    └───build
```

El backend está configurado para servir archivos estáticos desde ./fe/build. En el código, esto se maneja así:

```go
r.Static("/static", "./fe/build/static")
r.StaticFile("/", "./fe/build/index.html")
```

### Pasos

1. Construye el frontend:

    ```bash
    cd fe
    npm run build
    ```

2. Coloca la carpeta `build` en la ruta `fe/build` relativa al binario del backend.

3. Coloca tu archivo `.env` en la misma carpeta donde esté el ejecutable `tickets-app.exe`.

4. Ejecuta el binario directamente:

    ```bash
    ./tickets-app.exe
    ```

---

## ✅ Verificación

- Accede a la URL de la aplicación (ej. http://localhost:8080).
- Verifica que los recursos estáticos del frontend se sirvan correctamente.
- Asegúrate de que la conexión a base de datos y Telegram esté funcionando correctamente.

---

## 🛎️ Recomendación: ejecutar el sistema como servicio en Windows

Para asegurar que el sistema esté siempre activo incluso después de reiniciar el sistema, se recomienda instalar el binario como un servicio de Windows.

### Pasos para registrar el servicio:

1. Abre PowerShell o CMD como administrador.
2. Ejecuta el siguiente comando (ajusta las rutas a las de tu entorno):

    ```powershell
    sc create "TicketsApp" binPath= "C:\ruta\a\tickets-app.exe" start= auto
    ```

    > 🔧 **Nota:** La ruta debe ser absoluta y no debe tener comillas dobles alrededor. El espacio después de `=` es obligatorio por convención de `sc`.

3. Inicia el servicio:

    ```powershell
    sc start "TicketsApp"
    ```

### Consejos adicionales:

- El archivo `.env` **debe estar en la misma carpeta** que el ejecutable.
- Asegúrate de que el servicio tenga permisos suficientes para acceder a la base de datos y a internet (Telegram).
