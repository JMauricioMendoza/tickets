import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import DropdownComp from "./DropdownComp";
import ModalComp from "./ModalComp";
import LogoIceo from "../assets/img/logoIceo.png";
import forzarCierreSesion from "../utils/forzarCierreSesion";

function Layout({
  children,
  usuario,
  setUsuario,
  textoBotonRegresar,
  rutaBotonRegresar,
}) {
  return (
    <div className="flex items-start justify-center w-full min-h-screen bg-gray-200">
      <div className="flex flex-col items-center justify-center gap-12 w-[1080px] bg-white rounded-xl px-12 pb-14">
        <Encabezado
          usuario={usuario}
          setUsuario={setUsuario}
          textoBotonRegresar={textoBotonRegresar}
          rutaBotonRegresar={rutaBotonRegresar}
        />
        {children}
      </div>
    </div>
  );
}

function Encabezado({
  usuario,
  setUsuario,
  textoBotonRegresar,
  rutaBotonRegresar,
}) {
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
            forzarCierreSesion(navigate, location.pathname);
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
    <header className="flex flex-col gap-6 pt-3 w-full">
      <div className="flex justify-between">
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
            apiURL={apiURL}
            navigate={navigate}
            forzarCierreSesion={forzarCierreSesion}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <h1 className="text-2xl text-institucional font-bold">
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

function BotonRegresar({ textoBotonRegresar, rutaBotonRegresar, navigate }) {
  return (
    textoBotonRegresar &&
    rutaBotonRegresar && (
      <Button
        className="font-semibold"
        color="danger"
        variant="flat"
        onPress={() => navigate(rutaBotonRegresar)}
        startContent={<FaArrowLeft />}
      >
        {textoBotonRegresar}
      </Button>
    )
  );
}

export default Layout;
