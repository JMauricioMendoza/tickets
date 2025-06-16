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

function RecuperarUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState(new Set());
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

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
