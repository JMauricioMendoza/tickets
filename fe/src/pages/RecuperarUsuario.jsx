import { useState, useEffect } from "react";
import {
  Form,
  Autocomplete,
  AutocompleteItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import verificaAdmin from "../utils/verificaAdmin";
import ModalComp from "../components/ModalComp";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * RecuperarUsuario permite a administradores reactivar usuarios inactivos.
 * Protege la ruta, carga usuarios inactivos y centraliza feedback modal.
 */
function RecuperarUsuario() {
  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Lista de usuarios inactivos para recuperación.
  const [listaUsuarios, setListaUsuarios] = useState(new Set());
  // ID del usuario seleccionado para recuperar.
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estado para feedback modal y control de carga.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Carga usuarios inactivos al montar.
  function obtenerUsuarios() {
    obtenerDatos({
      url: "/ObtenerUsuariosInactivos",
      setDatos: setListaUsuarios,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Envía la solicitud de recuperación al backend.
  const recuperaUsuario = (ev) => {
    enviarDatos({
      ev,
      url: "/HabilitarUsuario",
      metodo: "PATCH",
      datos: { id: Number(usuarioSeleccionado) },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  // Protege la ruta y carga usuarios inactivos al montar.
  useEffect(() => {
    verificaAdmin(navigate);
    obtenerUsuarios();
  }, []);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de usuarios"
        rutaBotonRegresar="/usuarios-todos"
      >
        {/* Solo muestra el formulario si hay usuarios inactivos */}
        {listaUsuarios.length > 0 && (
          <Form className="w-full" onSubmit={recuperaUsuario}>
            <div className="flex gap-4 w-full">
              <Autocomplete
                label="Buscar usuario para recuperación de acceso"
                startContent={<FaSearch />}
                onSelectionChange={(value) => {
                  setUsuarioSeleccionado(value);
                }}
              >
                {/* Renderiza opciones de usuarios inactivos */}
                {listaUsuarios.map((item) => (
                  <AutocompleteItem
                    key={item.id}
                    textValue={`${item.nombre} - ${item.usuario}`}
                  >
                    {item.nombre} - {item.usuario}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <Button
                type="submit"
                color="primary"
                isDisabled={usuarioSeleccionado === null}
                isLoading={estaCargando}
              >
                Recuperar
              </Button>
            </div>
          </Form>
        )}
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
        // Redirige a la lista tras éxito.
        onAccept={
          varianteModal === "correcto"
            ? () => navigate("/usuarios-todos")
            : null
        }
      />
    </>
  );
}

export default RecuperarUsuario;
