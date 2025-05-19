import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaUserCircle } from "react-icons/fa";
import DropdownComp from "./DropdownComp";
import ModalComp from "./ModalComp";
import LogoIceo from "../assets/img/logoIceo.png";

function Layout({ children, usuario, setUsuario }) {
  return (
    <div className="flex items-start justify-center w-full min-h-screen bg-gray-200">
      <div
        className={`relative flex items-center justify-center ${usuario ? "pt-36 pb-12" : "min-h-[720px]"} w-[1080px] bg-white rounded-xl`}
      >
        <Encabezado usuario={usuario} setUsuario={setUsuario} />
        {children}
      </div>
    </div>
  );
}

function Encabezado({ usuario, setUsuario }) {
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  const location = useLocation();

  const apiURL = process.env.REACT_APP_API_URL;

  const verificaSesion = useCallback(() => {
    fetch(`${apiURL}/VerificaSesion`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            setUsuario({
              nombre: data.nombre,
              usuarioId: data.usuario_id,
            });
            break;
          case 401:
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("admin");

            if (location.pathname !== "/crear-ticket") navigate("/login");
            break;
          default:
            break;
        }
      });
  }, [setUsuario]);

  useEffect(() => {
    if (location.pathname !== "/login") verificaSesion();
  }, [location.pathname, verificaSesion]);

  return (
    <header className="flex items-center justify-between absolute top-0 px-12 py-4 w-full font-bold">
      <div className="w-60">
        <img className="object-cover w-full" src={LogoIceo} alt="Logo ICEO" />
      </div>
      {usuario ? (
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
          apiURL={apiURL}
        />
      ) : (
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl text-institucional">
            Plataforma de Gestión de Incidencias
          </h1>
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
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </header>
  );
}

export default Layout;
