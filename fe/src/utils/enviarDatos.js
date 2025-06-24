import forzarCierreSesion from "./forzarCierreSesion";

/**
 * enviarDatos centraliza el envío de datos a la API y el manejo de feedback UI.
 * Permite manejo flexible de respuestas, errores y control de carga.
 *
 * @param {object} params - Parámetros de configuración y callbacks.
 * @param {Event} [params.ev] - Evento submit para prevenir comportamiento por defecto.
 * @param {string} params.url - Endpoint relativo de la API.
 * @param {string} params.metodo - Método HTTP (POST, PATCH, etc).
 * @param {object} [params.datos] - Payload a enviar.
 * @param {boolean} [params.usarToken=true] - Si se debe incluir el token JWT.
 * @param {function} [params.onSuccess] - Callback en éxito (opcional).
 * @param {function} [params.onUnauthorized] - Callback en 401 (opcional).
 * @param {function} params.setEstaCargando - Setter para estado de carga.
 * @param {function} [params.navigate] - Función de navegación (opcional).
 * @param {function} params.onOpen - Abre modal de feedback.
 * @param {function} params.setVarianteModal - Setter de variante de modal.
 * @param {function} params.setMensajeModal - Setter de mensaje de modal.
 */
async function enviarDatos({
  ev = null,
  url,
  metodo,
  datos = null,
  usarToken = true,
  onSuccess = null,
  onUnauthorized = null,
  setEstaCargando,
  navigate = null,
  onOpen,
  setVarianteModal,
  setMensajeModal,
}) {
  // Previene el submit por defecto si viene de un formulario.
  if (ev?.preventDefault) ev.preventDefault();

  setEstaCargando(true);

  const serverURL = process.env.REACT_APP_API_URL;

  const headers = {
    "Content-Type": "application/json",
  };

  // Incluye token JWT si corresponde.
  if (usarToken) {
    const token = sessionStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${serverURL}${url}`, {
      method: metodo,
      headers,
      ...(datos ? { body: JSON.stringify(datos) } : {}),
    });

    // Intenta parsear la respuesta como JSON, si falla retorna objeto vacío.
    const data = await response.json().catch(() => ({}));
    setEstaCargando(false);

    // Manejo centralizado de errores HTTP.
    if (!response.ok) {
      switch (response.status) {
        case 400:
        case 409:
          // Errores de validación o conflicto: feedback de advertencia.
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal(data.mensaje);
          break;
        case 401:
          // No autorizado: permite callback custom o fuerza cierre de sesión.
          if (onUnauthorized) {
            onUnauthorized(data);
          } else {
            forzarCierreSesion(navigate);
          }
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

    // Si hay callback de éxito, lo ejecuta; si no, muestra feedback modal por defecto.
    if (onSuccess) {
      onSuccess(data);
    } else {
      onOpen();
      setVarianteModal("correcto");
      setMensajeModal(data.mensaje);
    }
  } catch {
    // Errores de red o inesperados: feedback de advertencia.
    setEstaCargando(false);
    onOpen();
    setVarianteModal("advertencia");
    setMensajeModal("Ocurrió un error inesperado.");
  }
}

export default enviarDatos;
