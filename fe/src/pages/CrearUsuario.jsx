import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
 * CrearUsuario permite a administradores registrar nuevos usuarios del sistema.
 * Valida permisos, controla feedback modal y asegura validación reactiva de campos.
 */
function CrearUsuario() {
  // Catálogo de áreas de soporte (tipos de ticket) disponibles.
  const [tipoTickets, setTipoTickets] = useState(null);

  // Estado para feedback modal y control de carga.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado de los inputs del formulario.
  const [valorNombre, setValorNombre] = useState("");
  const [valorUsuario, setValorUsuario] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorPassword, setValorPassword] = useState("");
  const [valorSwitch, setValorSwitch] = useState(false); // Privilegio admin

  // Flags de validación para habilitar/deshabilitar el botón de submit.
  const [nombreVacia, setNombreVacia] = useState(true);
  const [usuarioVacia, setUsuarioVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);
  const [passwordVacia, setPaswordVacia] = useState(true);

  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Envía el formulario para crear el usuario.
  const creaUsuario = (ev) => {
    enviarDatos({
      ev,
      url: "/CrearUsuario",
      metodo: "POST",
      datos: {
        nombre: valorNombre,
        password: valorPassword,
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

  // Protege la ruta: solo accesible para administradores y carga catálogos al montar.
  useEffect(() => {
    verificaAdmin(navigate);
    ObtenerTipoTickets();
  }, []);

  // Valida campos en tiempo real para UX y control de submit.
  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
    setUsuarioVacia(verificaVacio(valorUsuario));
    setTipoVacia(!(valorTipo.size > 0));
    setPaswordVacia(verificaVacio(valorPassword));
  }, [valorNombre, valorUsuario, valorTipo, valorPassword]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de usuarios"
        rutaBotonRegresar="/usuarios-todos"
      >
        <Form className="w-full" onSubmit={creaUsuario}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Crear un usuario
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
              <Input
                label="Contraseña"
                isRequired
                variant="flat"
                onChange={(ev) => eliminarEspacios(ev, setValorPassword)}
                value={valorPassword}
                type="password"
              />
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
                isDisabled={
                  nombreVacia || usuarioVacia || tipoVacia || passwordVacia
                }
                isLoading={estaCargando}
              >
                Crear usuario
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

export default CrearUsuario;
