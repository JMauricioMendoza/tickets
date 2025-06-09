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
import forzarCierreSesion from "../utils/forzarCierreSesion";
import ModalComp from "../components/ModalComp";

function EditarPassword() {
  const [usuario, setUsuario] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState(new Set());
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  const apiURL = process.env.REACT_APP_API_URL;

  function obtenerUsuarios() {
    fetch(`${apiURL}/ObtenerUsuariosInactivos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            setListaUsuarios(data.datos);
            break;
          case 401:
            forzarCierreSesion(navigate);
            break;
          default:
            break;
        }
      });
  }

  function enviarDatos(ev) {
    ev.preventDefault();
    setEstaCargando(true);

    const id = Number(usuarioSeleccionado);

    fetch(`${apiURL}/HabilitarUsuario`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id }),
    }).then(async (response) => {
      setEstaCargando(false);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          forzarCierreSesion(navigate);
        } else if (response.status === 400) {
          onOpen();
          setVarianteModal("advertencia");
          setMensajeModal(data.mensaje || "Ocurrió un error");
        } else if (response.status === 500) {
          onOpen();
          setVarianteModal("error");
          setMensajeModal(data.mensaje || "Error del servidor");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      onOpen();
      setVarianteModal("correcto");
      setMensajeModal(data.mensaje);
    });
  }

  useEffect(() => {
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
          <Form className="w-full" onSubmit={(ev) => enviarDatos(ev)}>
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

export default EditarPassword;
