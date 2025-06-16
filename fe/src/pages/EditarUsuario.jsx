import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Input,
  Select,
  SelectItem,
  Button,
  useDisclosure,
  Form,
  Switch,
} from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import eliminarEspacios from "../utils/eliminarEspacios";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

function EditarUsuario() {
  const [tipoTickets, setTipoTickets] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const [valorNombre, setValorNombre] = useState("");
  const [valorUsuario, setValorUsuario] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorSwitch, setValorSwitch] = useState(false);

  const [nombreVacia, setNombreVacia] = useState(true);
  const [usuarioVacia, setUsuarioVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);

  const [usuario, setUsuario] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};

  function ObtenerUsuario() {
    obtenerDatos({
      url: `/ObtenerUsuarioPorID/${id}`,
      setDatos: setDatosUsuario,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  function ObtenerTipoTickets() {
    obtenerDatos({
      url: "/ObtenerTipoTicketsActivos",
      usarToken: false,
      setDatos: setTipoTickets,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  const editaUsuario = (ev) => {
    enviarDatos({
      ev,
      url: "/ActualizarUsuario",
      metodo: "PATCH",
      datos: {
        id: datosUsuario.id,
        nombre: valorNombre,
        usuario: valorUsuario,
        administrador: valorSwitch,
        tipo_ticket_id: Array.from(valorTipo, Number),
      },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  useEffect(() => {
    verificaAdmin(navigate);
    ObtenerTipoTickets();
    ObtenerUsuario();
  }, []);

  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
    setUsuarioVacia(verificaVacio(valorUsuario));
    setTipoVacia(!(valorTipo.size > 0));
  }, [valorNombre, valorUsuario, valorTipo]);

  useEffect(() => {
    setValorNombre(datosUsuario?.nombre || "");
    setValorUsuario(datosUsuario?.usuario || "");
    setValorSwitch(datosUsuario?.administrador || false);

    if (datosUsuario) {
      if (datosUsuario.tipo_ticket_id !== null && tipoTickets) {
        setValorTipo(new Set(datosUsuario.tipo_ticket_id.map(String)));
      }
    }
  }, [datosUsuario, tipoTickets]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de usuarios"
        rutaBotonRegresar="/usuarios-todos"
      >
        <Form className="w-full" onSubmit={editaUsuario}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Editar usuario
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre completo"
                isRequired
                variant="flat"
                onChange={(ev) => setValorNombre(ev.target.value)}
                value={valorNombre}
              />
              <Input
                label="Nombre de usuario"
                isRequired
                variant="flat"
                onChange={(ev) => eliminarEspacios(ev, setValorUsuario)}
                value={valorUsuario}
              />
              <Select
                label="Áreas de soporte a atender"
                isRequired
                selectedKeys={valorTipo}
                onSelectionChange={setValorTipo}
                variant="flat"
                selectionMode="multiple"
              >
                {tipoTickets &&
                  tipoTickets.map((item) => (
                    <SelectItem key={item.id}>{item.nombre}</SelectItem>
                  ))}
              </Select>
              <Switch
                isSelected={valorSwitch}
                onValueChange={setValorSwitch}
                color="success"
              >
                {valorSwitch ? "Es administrador" : "No es administrador"}
              </Switch>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                isDisabled={nombreVacia || usuarioVacia || tipoVacia}
                isLoading={estaCargando}
              >
                Editar usuario
              </Button>
            </div>
          </div>
        </Form>
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

export default EditarUsuario;
