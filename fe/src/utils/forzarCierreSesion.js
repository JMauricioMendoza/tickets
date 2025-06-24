/**
 * forzarCierreSesion elimina credenciales del usuario y redirige al login.
 * Se utiliza ante respuestas 401 o cuando se requiere cerrar sesión por seguridad.
 *
 * @param {function} navigate - Función de navegación (react-router).
 * @param {string} [pathname] - Ruta actual, permite excepción para rutas públicas.
 */
export default function forzarCierreSesion(navigate, pathname) {
  // Elimina token y flag de admin del almacenamiento para invalidar sesión.
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("admin");

  // Redirige al login salvo en rutas públicas (ej. creación de ticket anónimo).
  if (pathname !== "/crear-ticket") {
    navigate("/login");
  }
}
