import { useEffect, useState, useCallback } from "react";
import { FaUserCircle } from "react-icons/fa";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import ModalComp from "./Modal";
import LogoIceo from "../assets/img/logoIceo.png";

function Encabezado({ usuario, setUsuario }) {
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const verificaSesion = useCallback(() => {
    fetch("http://localhost:8080/VerificaSesion", {
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
              area: data.area,
            });
            break;
          case 401:
            sessionStorage.removeItem("token");
            window.location.href = "/login";
            break;
          default:
            break;
        }
      });
  }, [setUsuario]);

  useEffect(() => {
    if (window.location.pathname !== "/login") {
      verificaSesion();
    }
  }, [verificaSesion]);

  return (
    <header className="flex items-center justify-between absolute top-0 px-12 w-full h-20 font-bold">
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
        />
      ) : (
        <h1 className="text-2xl text-institucional">
          Plataforma de Gestión de Incidencias
        </h1>
      )}
    </header>
  );
}

function DropdownComp({
  usuario,
  onOpen,
  setVarianteModal,
  setMensajeModal,
  isOpen,
  onOpenChange,
  varianteModal,
  mensajeModal,
}) {
  const CierraSesion = useCallback(() => {
    fetch(`http://localhost:8080/CerrarSesion/${usuario.usuarioId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            sessionStorage.removeItem("token");
            window.location.href = "/login";
            break;
          case 400:
            onOpen();
            setVarianteModal("advertencia");
            setMensajeModal(data.mensaje);
            break;
          default:
            break;
        }
      });
  }, [usuario.usuarioId, onOpen]);

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="light" radius="full" size="lg">
            <span className="text-4xl text-institucional">
              <FaUserCircle />
            </span>
            <p className="text-base text-black">{usuario.nombre}</p>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            onPress={CierraSesion}
          >
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </>
  );
}

export default Encabezado;
