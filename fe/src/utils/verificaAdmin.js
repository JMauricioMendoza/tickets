function verificaAdmin(navigate) {
  const admin = sessionStorage.getItem("admin");
  if (admin !== "true") {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");

    navigate("/login");
  }
}

export default verificaAdmin;
