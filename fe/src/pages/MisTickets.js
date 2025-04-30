import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  useDisclosure,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import { AiOutlinePlusCircle, AiOutlineReload } from "react-icons/ai";
import Layout from "../components/Layout";
import ModalComp from "../components/Modal";

function MisTickets() {
  const [usuario, setUsuario] = useState(null);
  const [varianteModal, setVarianteModal] = useState("");
  const [tickets, setTickets] = useState([]);
  const [ticketsFiltrados, setTicketsFiltrados] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const ticketsPorUsuario = useCallback(() => {
    setTickets([]);

    if (!usuario) return;

    fetch(
      `http://localhost:8080/ObtenerTicketsPorUsuario/${usuario.usuarioId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      },
    )
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
            sessionStorage.removeItem("token");
            window.location.href = "/login";
            break;
          default:
            break;
        }
      });
  }, [usuario, onOpen]);

  useEffect(() => {
    ticketsPorUsuario();
  }, [usuario, ticketsPorUsuario]);

  return (
    <>
      <Layout usuario={usuario} setUsuario={setUsuario}>
        <div className="flex flex-col gap-9 w-[900px]">
          <h2 className="text-institucional text-2xl font-semibold">
            Mis tickets
          </h2>
          <span>
            <Button
              className="font-semibold"
              color="primary"
              variant="solid"
              startContent={<AiOutlinePlusCircle />}
              onPress={() => window.location.replace("/Ticket")}
            >
              Nuevo ticket
            </Button>
          </span>
          <Selects
            tickets={tickets}
            setTicketsFiltrados={setTicketsFiltrados}
            ticketsFiltrados={ticketsFiltrados}
          />
          <span>
            <Button
              className="font-semibold"
              color="secondary"
              variant="solid"
              startContent={<AiOutlineReload />}
              onPress={ticketsPorUsuario}
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
      description="No hay tickets de soporte para mostrar. Si necesitas ayuda, inicia uno nuevo para recibir asistencia."
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
                <p>{item.creado_en.substring(0, 10)}</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="pt-5 pr-5 pl-5 text-base">{item.descripcion}</p>
            </CardBody>
            <Divider />
            <CardFooter>
              <div className="flex justify-end gap-5 px-5 w-full">
                <Chip variant="flat">{item.tipo_ticket_nombre}</Chip>
                <Chip
                  variant="flat"
                  color={coloresPorEstatus[item.estatus_ticket_id] || "default"}
                >
                  {item.estatus_ticket_nombre}
                </Chip>
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

export default MisTickets;
