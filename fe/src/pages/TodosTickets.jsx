import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useDisclosure,
  Chip,
  Select,
  SelectItem,
  Link as HeroLink,
} from "@heroui/react";
import { AiOutlineReload } from "react-icons/ai";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * TicketsTodos muestra todos los tickets y permite filtrado por tipo y estatus.
 * Centraliza feedback modal y asegura actualización reactiva de la lista.
 */
function TicketsTodos() {
  const [usuario, setUsuario] = useState(null);

  // Estado para feedback modal y control de mensajes.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  // Estado de tickets y tickets filtrados.
  const [tickets, setTickets] = useState([]);
  const [ticketsFiltrados, setTicketsFiltrados] = useState([]);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Carga todos los tickets del backend.
  function obtenerTickets() {
    setTickets([]); // Limpia antes de cargar para evitar estados inconsistentes.

    // Solo carga si hay usuario autenticado.
    if (!usuario) return;

    obtenerDatos({
      url: "/ObtenerTickets",
      onSuccess: (data) => {
        setTickets(data.datos);
        setTicketsFiltrados(data.datos ? data.datos : []);
      },
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Carga tickets al montar o cuando cambia el usuario.
  useEffect(() => {
    obtenerTickets();
  }, [usuario]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Menú principal"
        rutaBotonRegresar="/dashboard"
      >
        <div className="flex flex-col gap-9 w-full">
          <h2 className="text-institucional text-2xl font-semibold">
            Todos los tickets
          </h2>
          {/* Filtros de tipo y estatus */}
          <Selects
            tickets={tickets}
            setTicketsFiltrados={setTicketsFiltrados}
            ticketsFiltrados={ticketsFiltrados}
          />
          <span>
            <Button
              className="font-semibold"
              color="primary"
              variant="solid"
              startContent={<AiOutlineReload />}
              onPress={() => obtenerTickets()}
            >
              Actualizar lista
            </Button>
          </span>
          {/* Renderiza lista o alerta según disponibilidad */}
          {ticketsFiltrados.length > 0 ? (
            <ListaTickets ticketsFiltrados={ticketsFiltrados} />
          ) : (
            <Alerta />
          )}
        </div>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </>
  );
}

/**
 * Alerta muestra un mensaje cuando no hay tickets disponibles.
 */
function Alerta() {
  return (
    <Alert
      color="warning"
      description="Actualmente no hay tickets. Por favor, verifica más tarde o actualiza la página para revisar si hay nuevos tickets disponibles."
      title="Sin tickets de soporte disponibles"
      variant="faded"
    />
  );
}

/**
 * ListaTickets renderiza la lista de tickets filtrados.
 * Usa chips para mostrar metadatos clave y coloriza el estatus.
 */
function ListaTickets({ ticketsFiltrados }) {
  // Mapeo de colores por estatus para visual feedback.
  const coloresPorEstatus = {
    1: "warning",
    2: "secondary",
    3: "success",
    4: "danger",
  };

  return (
    <div className="flex flex-col gap-7">
      {ticketsFiltrados &&
        ticketsFiltrados.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between pt-5 pr-5 pl-5 w-full">
                <p className="text-medium font-semibold">Ticket #{item.id}</p>
                <div className="flex gap-2">
                  <p className="font-medium">
                    {item.creado_en.substring(0, 10)}
                  </p>
                  <p>{item.creado_en.substring(11, 16)}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p className="pt-5 pr-5 pl-5 text-base">{item.descripcion}</p>
            </CardBody>
            <CardFooter>
              <div className="flex flex-col gap-5 px-5 w-full">
                <div className="flex gap-1">
                  <Chip variant="flat">{item.creado_por}</Chip>
                  <Chip variant="flat">{item.area_nombre}</Chip>
                  <Chip variant="flat">{item.tipo_ticket_nombre}</Chip>
                  <Chip
                    variant="flat"
                    color={
                      coloresPorEstatus[item.estatus_ticket_id] || "default"
                    }
                  >
                    {item.estatus_ticket_nombre}
                  </Chip>
                </div>
                <span>
                  <HeroLink
                    as={RouterLink}
                    to="/editar-ticket"
                    state={{ ticketID: item.id }}
                    className="font-bold"
                    color="secondary"
                    underline="always"
                  >
                    Editar ticket
                  </HeroLink>
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}

/**
 * Selects permite filtrar tickets por tipo y estatus.
 * Memoiza opciones únicas para evitar renders innecesarios y mejorar UX.
 */
function Selects({ tickets, ticketsFiltrados, setTicketsFiltrados }) {
  const [valorSelectEstatusTicket, setValorSelectEstatusTicket] = useState(
    new Set("0"),
  );
  const [valorSelectTipoTicket, setValorSelectTipoTicket] = useState(
    new Set("0"),
  );

  // Filtra tickets reactivo según selección de tipo/estatus.
  useEffect(() => {
    const estatus = Number(Array.from(valorSelectEstatusTicket)[0]);
    const tipo = Number(Array.from(valorSelectTipoTicket)[0]);

    let filtrados = tickets;

    if (estatus !== 0) {
      filtrados = filtrados.filter(
        (ticket) => ticket.estatus_ticket_id === estatus,
      );
    }

    if (tipo !== 0) {
      filtrados = filtrados.filter((ticket) => ticket.tipo_ticket_id === tipo);
    }

    setTicketsFiltrados(filtrados || []);
  }, [
    valorSelectEstatusTicket,
    valorSelectTipoTicket,
    tickets,
    setTicketsFiltrados,
  ]);

  // Memoiza opciones únicas de tipo de ticket para evitar duplicados.
  const opcionesTipoTicketUnicas = useMemo(() => {
    const idsTipoTicketAgregados = new Set();
    return ticketsFiltrados.filter((ticket) => {
      if (idsTipoTicketAgregados.has(ticket.tipo_ticket_id)) return false;
      idsTipoTicketAgregados.add(ticket.tipo_ticket_id);
      return true;
    });
  }, [ticketsFiltrados]);

  // Memoiza opciones únicas de estatus de ticket para evitar duplicados.
  const opcionesEstatusTicketUnicas = useMemo(() => {
    const idsEstatusTicketAgregados = new Set();
    return ticketsFiltrados.filter((ticket) => {
      if (idsEstatusTicketAgregados.has(ticket.estatus_ticket_id)) return false;
      idsEstatusTicketAgregados.add(ticket.estatus_ticket_id);
      return true;
    });
  }, [ticketsFiltrados]);

  return (
    <div className="flex gap-5">
      <div className="w-72">
        <Select
          label="Área de soporte"
          variant="flat"
          defaultSelectedKeys={["0"]}
          onSelectionChange={setValorSelectTipoTicket}
          disallowEmptySelection
        >
          <SelectItem key="0">Mostrar todos</SelectItem>
          {opcionesTipoTicketUnicas.map((item) => (
            <SelectItem key={item.tipo_ticket_id}>
              {item.tipo_ticket_nombre}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="w-72">
        <Select
          label="Estatus del ticket"
          variant="flat"
          defaultSelectedKeys={["0"]}
          onSelectionChange={setValorSelectEstatusTicket}
          disallowEmptySelection
        >
          <SelectItem key="0">Mostrar todos</SelectItem>
          {opcionesEstatusTicketUnicas.map((item) => (
            <SelectItem key={item.estatus_ticket_id}>
              {item.estatus_ticket_nombre}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default TicketsTodos;
