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

/**
 * DropdownComp muestra el menú contextual del usuario autenticado.
 * Permite cambiar contraseña y cerrar sesión.
 * Centraliza feedback y navegación tras logout.
 */
function DropdownComp({
  usuario,
  onOpen,
  setVarianteModal,
  setMensajeModal,
  navigate,
  forzarCierreSesion,
}) {
  // Controla el estado de carga para evitar acciones duplicadas en logout.
  const [estaCargando, setEstaCargando] = useState(false);

  // Cierra sesión y fuerza navegación tras éxito.
  const cierraSesion = () => {
    enviarDatos({
      url: `/CerrarSesion/${usuario.usuario_id}`,
      metodo: "DELETE",
      usarToken: false,
      onSuccess: () => {
        forzarCierreSesion(navigate); // Limpia estado global y redirige.
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
              // Navega a pantalla de cambio de contraseña, pasando el ID por state.
              navigate("/editar-password", {
                state: { id: usuario.usuario_id },
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
          isDisabled={estaCargando} // Previene doble submit en logout.
        >
          Cerrar sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default DropdownComp;
