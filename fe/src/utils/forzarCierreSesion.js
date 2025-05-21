export default function forzarCierreSesion(navigate, pathname) {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("admin");

  if (pathname !== "/crear-ticket") {
    navigate("/login");
  }
}
