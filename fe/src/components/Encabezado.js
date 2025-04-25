import { useEffect, useState, useCallback } from "react";
import { styled } from "styled-components";
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
    <EncabezadoH>
      <LogoIceoImg>
        <img src={LogoIceo} alt="Logo ICEO" />
      </LogoIceoImg>
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
        <Titulo>Plataforma de Gestión de Incidencias</Titulo>
      )}
    </EncabezadoH>
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
            <Icon>
              <FaUserCircle />
            </Icon>
            <Nombre>{usuario.nombre}</Nombre>
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

const EncabezadoH = styled.header`
  align-items: center;
  display: flex;
  font-weight: 700;
  justify-content: space-between;
  height: 90px;
  padding: 0 50px;
  position: absolute;
  top: 0;
  width: 100%;
`;

const LogoIceoImg = styled.div`
  width: 250px;

  img {
    object-fit: cover;
    width: 100%;
  }
`;

const Titulo = styled.h1`
  color: #9d2348;
  font-size: 24px;
`;

const Icon = styled.span`
  color: #9d2348;
  font-size: 35px;
`;

const Nombre = styled.p`
  color: #000000;
  font-size: 16px;
`;

export default Encabezado;
