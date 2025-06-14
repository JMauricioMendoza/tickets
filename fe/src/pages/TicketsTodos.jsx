import { useState, useEffect, useCallback, useMemo } from "react";
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
import forzarCierreSesion from "../utils/forzarCierreSesion";

function TicketsTodos() {
  const [usuario, setUsuario] = useState(null);
  const [varianteModal, setVarianteModal] = useState("");
  const [tickets, setTickets] = useState([]);
  const [ticketsFiltrados, setTicketsFiltrados] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const apiURL = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  const obtenerTickets = useCallback(() => {
    setTickets([]);

    if (!usuario) return;

    fetch(`${apiURL}/ObtenerTickets`, {
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
            setTickets(data.tickets);
            setTicketsFiltrados(data.tickets ? data.tickets : []);
            break;
          case 401:
            forzarCierreSesion(navigate);
            break;
          default:
            break;
        }
      });
  }, [usuario, onOpen]);

  useEffect(() => {
    obtenerTickets();
  }, [usuario, obtenerTickets]);

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
              onPress={obtenerTickets}
            >
              Actualizar lista
            </Button>
          </span>
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
      />
    </>
  );
}

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

function ListaTickets({ ticketsFiltrados }) {
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

function Selects({ tickets, ticketsFiltrados, setTicketsFiltrados }) {
  const [valorSelectEstatusTicket, setValorSelectEstatusTicket] = useState(
    new Set("0"),
  );
  const [valorSelectTipoTicket, setValorSelectTipoTicket] = useState(
    new Set("0"),
  );

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

  const opcionesTipoTicketUnicas = useMemo(() => {
    const idsTipoTicketAgregados = new Set();
    return ticketsFiltrados.filter((ticket) => {
      if (idsTipoTicketAgregados.has(ticket.tipo_ticket_id)) return false;
      idsTipoTicketAgregados.add(ticket.tipo_ticket_id);
      return true;
    });
  }, [ticketsFiltrados]);

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
