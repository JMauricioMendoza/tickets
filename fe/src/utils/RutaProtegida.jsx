import { Navigate, Outlet } from "react-router-dom";

/**
 * RutaProtegida es un componente de protección de rutas.
 * Solo permite acceso a rutas hijas si existe un token JWT en sessionStorage.
 * Si no hay token, redirige a la ruta pública "/crear-ticket".
 */
function RutaProtegida() {
  // Obtiene el token JWT de la sesión para validar autenticación.
  const token = sessionStorage.getItem("token");

  // Renderiza las rutas hijas si está autenticado, si no redirige.
  return token ? <Outlet /> : <Navigate to="/crear-ticket" />;
}

export default RutaProtegida;
