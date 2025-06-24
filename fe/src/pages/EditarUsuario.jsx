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

/**
 * EditarUsuario permite a administradores modificar datos y privilegios de un usuario.
 * Protege la ruta, carga catálogos y datos dependientes, y controla feedback modal.
 */
function EditarUsuario() {
  // Catálogo de áreas de soporte (tipos de ticket) y datos actuales del usuario.
  const [tipoTickets, setTipoTickets] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);

  // Estado para feedback modal y control de carga.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado de los inputs del formulario.
  const [valorNombre, setValorNombre] = useState("");
  const [valorUsuario, setValorUsuario] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorSwitch, setValorSwitch] = useState(false);

  // Flags de validación para habilitar/deshabilitar el botón de submit.
  const [nombreVacia, setNombreVacia] = useState(true);
  const [usuarioVacia, setUsuarioVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);

  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};

  // Carga los datos del usuario a editar.
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

  // Carga tipos de ticket activos para selección múltiple.
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

  // Envía los cambios al backend.
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
        tipo_ticket_id: Array.from(valorTipo, Number), // Convierte Set a array de IDs numéricos.
      },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  // Protege la ruta y carga catálogos/datos al montar.
  useEffect(() => {
    verificaAdmin(navigate);
    ObtenerTipoTickets();
    ObtenerUsuario();
  }, []);

  // Valida campos en tiempo real para UX y control de submit.
  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
    setUsuarioVacia(verificaVacio(valorUsuario));
    setTipoVacia(!(valorTipo.size > 0));
  }, [valorNombre, valorUsuario, valorTipo]);

  // Sincroniza los inputs con los datos cargados del usuario.
  useEffect(() => {
    setValorNombre(datosUsuario?.nombre || "");
    setValorUsuario(datosUsuario?.usuario || "");
    setValorSwitch(datosUsuario?.administrador || false);

    // Sincroniza selección múltiple de áreas de soporte.
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
                {/* Renderiza áreas de soporte dinámicamente */}
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

export default EditarUsuario;
