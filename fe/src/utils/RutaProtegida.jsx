import { Navigate, Outlet } from "react-router-dom";

function RutaProtegida() {
  const token = sessionStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/crear-ticket" />;
}

export default RutaProtegida;
