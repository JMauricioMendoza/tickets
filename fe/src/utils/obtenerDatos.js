import forzarCierreSesion from "./forzarCierreSesion";

/**
 * obtenerDatos centraliza peticiones GET a la API y el manejo de feedback UI.
 * Permite manejo flexible de respuestas, errores y control de datos.
 *
 * @param {object} params - Parámetros de configuración y callbacks.
 * @param {string} params.url - Endpoint relativo de la API.
 * @param {boolean} [params.usarToken=true] - Si se debe incluir el token JWT.
 * @param {function} params.setDatos - Setter para actualizar el estado con los datos recibidos.
 * @param {function} [params.onSuccess] - Callback en éxito (opcional, reemplaza setDatos).
 * @param {function} [params.navigate] - Función de navegación (opcional).
 * @param {string} [params.pathname] - Ruta actual, para control de cierre de sesión.
 * @param {function} params.onOpen - Abre modal de feedback.
 * @param {function} params.setVarianteModal - Setter de variante de modal.
 * @param {function} params.setMensajeModal - Setter de mensaje de modal.
 */
async function obtenerDatos({
  url,
  usarToken = true,
  setDatos,
  onSuccess = null,
  navigate = null,
  pathname = null,
  onOpen,
  setVarianteModal,
  setMensajeModal,
  setEstaCargando = null,
}) {
  const serverURL = process.env.REACT_APP_API_URL;

  const headers = {};

  // Incluye token JWT si corresponde.
  if (usarToken) {
    const token = sessionStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${serverURL}${url}`, {
      method: "GET",
      headers,
    });

    // Intenta parsear la respuesta como JSON, si falla retorna objeto vacío.
    const data = await response.json().catch(() => ({}));
    if (setEstaCargando) {
      setEstaCargando(false);
    }

    // Manejo centralizado de errores HTTP.
    if (!response.ok) {
      switch (response.status) {
        case 400:
          // Errores de validación: feedback de advertencia.
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal(data.mensaje);
          break;
        case 401:
          // No autorizado: fuerza cierre de sesión.
          forzarCierreSesion(navigate, pathname);
          break;
        case 500:
          // Error de servidor: feedback de error.
          onOpen();
          setVarianteModal("error");
          setMensajeModal("Error en el servidor.");
          break;
        default:
          // Otros errores: advertencia genérica.
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal("No se ha podido completar la petición.");
          break;
      }
      return;
    }

    // Si hay callback de éxito, lo ejecuta; si no, actualiza el estado con los datos.
    if (onSuccess) {
      onSuccess(data);
    } else {
      setDatos(data.datos);
    }
  } catch {
    if (setEstaCargando) {
      setEstaCargando(false);
    }
    // Errores de red o inesperados: feedback de advertencia.
    onOpen();
    setVarianteModal("advertencia");
    setMensajeModal("Ocurrió un error inesperado.");
  }
}

export default obtenerDatos;
