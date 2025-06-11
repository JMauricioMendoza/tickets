import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import { FaUserCircle } from "react-icons/fa";
import enviarDatos from "../utils/enviarDatos";

function DropdownComp({
  usuario,
  onOpen,
  setVarianteModal,
  setMensajeModal,
  navigate,
  forzarCierreSesion,
}) {
  const [estaCargando, setEstaCargando] = useState(false);

  const cierraSesion = () => {
    enviarDatos({
      url: `/CerrarSesion/${usuario.usuarioId}`,
      metodo: "DELETE",
      usarToken: false,
      onSuccess: () => {
        forzarCierreSesion(navigate);
      },
      setEstaCargando,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  return (
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
        <DropdownSection showDivider>
          <DropdownItem
            key="password"
            onPress={() => {
              navigate("/editar-password", {
                state: { id: usuario.usuarioId },
              });
            }}
          >
            Cambiar contraseña
          </DropdownItem>
        </DropdownSection>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          onPress={cierraSesion}
          isDisabled={estaCargando}
        >
          Cerrar sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default DropdownComp;
