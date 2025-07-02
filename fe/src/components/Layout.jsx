import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import DropdownComp from "./DropdownComp";
import ModalComp from "./ModalComp";
import LogoIceo from "../assets/img/logoIceo.png";
import forzarCierreSesion from "../utils/forzarCierreSesion";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * Layout centraliza el diseño y el encabezado de la app.
 * Permite inyectar usuario, navegación y controles de sesión a los hijos.
 */
function Layout({
  children,
  usuario,
  setUsuario,
  textoBotonRegresar,
  rutaBotonRegresar,
}) {
  const [estaCargando, setEstaCargando] = useState(true);

  return (
    <div className="flex items-start justify-center w-full min-h-screen bg-gray-200">
      <div className="flex flex-col items-center justify-center gap-12 w-[1080px] bg-white rounded-xl px-12 pb-14 shadow-xl">
        <Encabezado
          usuario={usuario}
          setUsuario={setUsuario}
          textoBotonRegresar={textoBotonRegresar}
          rutaBotonRegresar={rutaBotonRegresar}
          setEstaCargando={setEstaCargando}
        />
        {children}
      </div>
      {estaCargando && (
        <div id="loader">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}

/**
 * Encabezado muestra el logo, controles de usuario y navegación contextual.
 * Valida sesión automáticamente al montar (excepto en /login).
 */
function Encabezado({
  usuario,
  setUsuario,
  textoBotonRegresar,
  rutaBotonRegresar,
  setEstaCargando,
}) {
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");

  // Controla la visibilidad de modales de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();
  const location = useLocation();

  // Valida sesión activa y actualiza estado global de usuario.
  function verificaSesion() {
    obtenerDatos({
      url: "/VerificaSesion",
      setDatos: setUsuario,
      navigate,
      pathname: location.pathname,
      onOpen,
      setVarianteModal,
      setMensajeModal,
      setEstaCargando,
    });
  }

  const esRutaProtegida = location.pathname !== "/login";

  // Solo verifica sesión si no está en la pantalla de login.
  useEffect(() => {
    if (esRutaProtegida) {
      verificaSesion();
    } else {
      setEstaCargando(false);
    }
  }, []);

  return (
    <header className="flex flex-col gap-6 pt-3 w-full">
      <div className="flex justify-between">
        <div className="w-60">
          <img className="object-cover w-full" src={LogoIceo} alt="Logo ICEO" />
        </div>
        {usuario ? (
          // DropdownComp centraliza acciones de usuario autenticado (perfil, logout, etc.)
          <DropdownComp
            usuario={usuario}
            onOpen={onOpen}
            setVarianteModal={setVarianteModal}
            setMensajeModal={setMensajeModal}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            varianteModal={varianteModal}
            mensajeModal={mensajeModal}
            navigate={navigate}
            forzarCierreSesion={forzarCierreSesion}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <h1 className="text-2xl text-institucional font-bold">
              Plataforma de Gestión de Incidencias
            </h1>
            {/* Muestra acceso rápido a login si no está autenticado */}
            {location.pathname !== "/login" ? (
              <span>
                <Button
                  variant="light"
                  className="text-9xl"
                  onPress={() => navigate("/login")}
                >
                  <FaUserCircle />
                </Button>
              </span>
            ) : null}
          </div>
        )}
      </div>
      <span>
        <BotonRegresar
          textoBotonRegresar={textoBotonRegresar}
          rutaBotonRegresar={rutaBotonRegresar}
          navigate={navigate}
        />
      </span>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </header>
  );
}

/**
 * Botón contextual para regresar a una ruta específica.
 * Solo se muestra si recibe texto y ruta válidos.
 */
function BotonRegresar({ textoBotonRegresar, rutaBotonRegresar, navigate }) {
  return (
    textoBotonRegresar &&
    rutaBotonRegresar && (
      <Button
        className="font-semibold"
        color="danger"
        variant="bordered"
        onPress={() => navigate(rutaBotonRegresar)}
        startContent={<FaArrowLeft />}
      >
        {textoBotonRegresar}
      </Button>
    )
  );
}

export default Layout;
