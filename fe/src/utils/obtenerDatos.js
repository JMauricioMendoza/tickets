import forzarCierreSesion from "./forzarCierreSesion";

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
}) {
  const serverURL = process.env.REACT_APP_API_URL;

  const headers = {};

  if (usarToken) {
    const token = sessionStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${serverURL}${url}`, {
      method: "GET",
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      switch (response.status) {
        case 400:
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal(data.mensaje);
          break;
        case 401:
          forzarCierreSesion(navigate, pathname);
          break;
        case 500:
          onOpen();
          setVarianteModal("error");
          setMensajeModal("Error en el servidor.");
          break;
        default:
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal("No se ha podido completar la petición.");
          break;
      }

      return;
    }

    if (onSuccess) {
      onSuccess(data);
    } else {
      setDatos(data.datos);
    }
  } catch {
    onOpen();
    setVarianteModal("advertencia");
    setMensajeModal("Ocurrió un error inesperado.");
  }
}

export default obtenerDatos;
