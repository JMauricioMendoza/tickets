import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Importa estilos globales y utilidades de Tailwind

// Punto de entrada principal de la app.
// Se utiliza React.StrictMode para detectar problemas potenciales en desarrollo.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
