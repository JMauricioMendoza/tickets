function verificaSesion() {
  fetch("http://localhost:8080/VerificaSesion", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  }).then((response) => {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return response.json();
  });
}

export default verificaSesion;
