/**
 * verificaAdmin protege rutas restringidas a administradores.
 * Si el usuario no es admin, elimina credenciales y redirige al login.
 *
 * @param {function} navigate - Función de navegación (react-router).
 */
function verificaAdmin(navigate) {
  const admin = sessionStorage.getItem("admin");
  if (admin !== "true") {
    // Elimina credenciales para evitar acceso indebido.
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");

    // Redirige al login si no es administrador.
    navigate("/login");
  }
}

export default verificaAdmin;
