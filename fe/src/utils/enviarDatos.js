import forzarCierreSesion from "./forzarCierreSesion";

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
  if (ev?.preventDefault) ev.preventDefault();

  setEstaCargando(true);

  const serverURL = process.env.REACT_APP_API_URL;

  const headers = {
    "Content-Type": "application/json",
  };

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

    const data = await response.json().catch(() => ({}));
    setEstaCargando(false);

    if (!response.ok) {
      switch (response.status) {
        case 400:
        case 409:
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal(data.mensaje);
          break;
        case 401:
          if (onUnauthorized) {
            onUnauthorized(data);
          } else {
            forzarCierreSesion(navigate);
          }
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
      onOpen();
      setVarianteModal("correcto");
      setMensajeModal(data.mensaje);
    }
  } catch (err) {
    setEstaCargando(false);

    onOpen();
    setVarianteModal("advertencia");
    setMensajeModal("Ocurrió un error inesperado.");
  }
}

export default enviarDatos;
