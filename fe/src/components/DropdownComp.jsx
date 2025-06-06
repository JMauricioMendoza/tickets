import { useCallback } from "react";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import { FaUserCircle } from "react-icons/fa";

function DropdownComp({
  usuario,
  onOpen,
  setVarianteModal,
  setMensajeModal,
  apiURL,
  navigate,
  forzarCierreSesion,
}) {
  const CierraSesion = useCallback(() => {
    fetch(`${apiURL}/CerrarSesion/${usuario.usuarioId}`, {
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
            forzarCierreSesion(navigate);
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
          onPress={CierraSesion}
        >
          Cerrar sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default DropdownComp;
