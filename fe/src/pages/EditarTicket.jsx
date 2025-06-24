import { useState, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  useDisclosure,
  Form,
} from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * EditarTicket permite modificar tipo y estatus de un ticket existente.
 * Carga datos dependientes y controla feedback modal.
 */
function EditarTicket() {
  // Catálogos y datos del ticket.
  const [tipoTickets, setTipoTickets] = useState(null);
  const [estatusTickets, setEstatusTickets] = useState(null);
  const [ticket, setTicket] = useState(null);

  // Estado para feedback modal y control de carga.
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado de selects y flags de validación.
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorEstatus, setValorEstatus] = useState(new Set([]));
  const [tipoVacia, setTipoVacia] = useState(true);
  const [estatusVacia, setEstatusVacia] = useState(true);

  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const navigate = useNavigate();
  // Obtiene el ID del ticket a editar desde el state de navegación.
  const { ticketID } = location.state || {};

  // Carga tipos de ticket activos.
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

  // Carga estatus de ticket activos.
  function ObtenerEstatusTickets() {
    obtenerDatos({
      url: "/ObtenerEstatusTicketsActivos",
      setDatos: setEstatusTickets,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Carga los datos actuales del ticket.
  function ObtenerTicket() {
    obtenerDatos({
      url: `/ObtenerTicketPorID/${ticketID}`,
      setDatos: setTicket,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Envía los cambios al backend.
  const editaTicket = (ev) => {
    enviarDatos({
      ev,
      url: "/ActualizarTicket",
      metodo: "PATCH",
      datos: {
        id: ticket.id,
        tipo_ticket_id: Number(Array.from(valorTipo)[0]),
        estatus_ticket_id: Number(Array.from(valorEstatus)[0]),
      },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  // Carga catálogos y datos del ticket al montar.
  useEffect(() => {
    ObtenerTipoTickets();
    ObtenerEstatusTickets();
    ObtenerTicket();
    // eslint-disable-next-line
  }, []);

  // Valida selects para habilitar/deshabilitar submit.
  useEffect(() => {
    setTipoVacia(!(valorTipo.size > 0));
    setEstatusVacia(!(valorEstatus.size > 0));
  }, [valorTipo, valorEstatus]);

  // Sincroniza selects con los datos actuales del ticket.
  useEffect(() => {
    if (ticket) {
      setValorTipo(new Set([ticket.tipo_ticket_id.toString()]));
      setValorEstatus(new Set([ticket.estatus_ticket_id.toString()]));
    }
  }, [ticket]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de tickets"
        rutaBotonRegresar="/tickets-todos"
      >
        <Form className="w-full" onSubmit={editaTicket}>
          {ticket && tipoTickets && estatusTickets ? (
            <div className="flex flex-col gap-9 w-full">
              <h2 className="text-institucional text-2xl font-semibold">
                Editar un ticket
              </h2>
              <h3 className="text-lg font-medium">Ticket #{ticket.id}</h3>
              <div className="grid grid-cols-2 gap-x-9 gap-y-12">
                <Input
                  label="Nombre de quien reporta"
                  variant="flat"
                  value={ticket.creado_por}
                  isDisabled
                />
                <Select
                  label="Área de adscripción"
                  selectedKeys={new Set([ticket.area_id.toString()])}
                  variant="flat"
                  isDisabled
                >
                  <SelectItem key={ticket.area_id}>
                    {ticket.area_nombre}
                  </SelectItem>
                </Select>
                <Select
                  label="Área de soporte solicitada"
                  isRequired
                  selectedKeys={valorTipo}
                  onSelectionChange={setValorTipo}
                  variant="flat"
                >
                  {/* Renderiza tipos de ticket activos */}
                  {tipoTickets &&
                    tipoTickets.map((item) => (
                      <SelectItem key={item.id}>{item.nombre}</SelectItem>
                    ))}
                </Select>
                <Select
                  label="Estatus actual del ticket"
                  isRequired
                  selectedKeys={valorEstatus}
                  onSelectionChange={setValorEstatus}
                  variant="flat"
                >
                  {/* Renderiza estatus activos */}
                  {estatusTickets &&
                    estatusTickets.map((item) => (
                      <SelectItem key={item.id}>{item.nombre}</SelectItem>
                    ))}
                </Select>
                <div className="row-start-3 row-end-4 col-start-1 col-end-3">
                  <Textarea
                    label="Descripción del problema"
                    isDisabled
                    variant="flat"
                    value={ticket.descripcion}
                  />
                </div>
              </div>
              <div className="flex justify-between w-full">
                <Button
                  type="submit"
                  color="danger"
                  onPress={() => navigate("/tickets-todos")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isDisabled={tipoVacia || estatusVacia}
                  isLoading={estaCargando}
                >
                  Aceptar
                </Button>
              </div>
            </div>
          ) : null}
        </Form>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
        // Redirige a la lista tras éxito.
        onAccept={
          varianteModal === "correcto" ? () => navigate("/tickets-todos") : null
        }
      />
    </>
  );
}

export default EditarTicket;
