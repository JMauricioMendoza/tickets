import { useState, useEffect, useCallback } from "react";
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
import obtenerValorSet from "../utils/obtenerValorSet";

function EditarTicket() {
  const [tipoTickets, setTipoTickets] = useState(null);
  const [estatusTickets, setEstatusTickets] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");

  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorEstatus, setValorEstatus] = useState(new Set([]));

  const [tipoVacia, setTipoVacia] = useState(true);
  const [estatusVacia, setEstatusVacia] = useState(true);

  const [usuario, setUsuario] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const apiURL = process.env.REACT_APP_API_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const { ticketID } = location.state || {};

  const ObtenerTipoTickets = useCallback(() => {
    fetch(`${apiURL}/ObtenerTipoTicketsActivos`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            setTipoTickets(data.tipoTickets);
            break;
          default:
            break;
        }
      });
  }, [onOpen]);

  const ObtenerEstatusTickets = useCallback(() => {
    fetch(`${apiURL}/ObtenerEstatusTicketsActivos`, {
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
            setEstatusTickets(data.estatusTickets);
            break;
          case 401:
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("admin");
            navigate("/login");
            break;
          default:
            break;
        }
      });
  }, [onOpen]);

  const ObtenerTicket = useCallback(() => {
    fetch(`${apiURL}/ObtenerTicketPorID/${ticketID}`, {
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
            setTicket(data.ticket);
            break;
          case 401:
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("admin");
            navigate("/login");
            break;
          default:
            break;
        }
      });
  }, [onOpen]);

  function enviarDatos(ev) {
    ev.preventDefault();
    const tipoID = obtenerValorSet(valorTipo);
    const estatusID = obtenerValorSet(valorEstatus);
    fetch(`${apiURL}/ActualizarTicket`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: ticket.id,
        tipo_ticket_id: tipoID,
        estatus_ticket_id: estatusID,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            onOpen();
            setVarianteModal("correcto");
            setMensajeModal(data.mensaje);
            break;
          case 400:
            onOpen();
            setVarianteModal("advertencia");
            setMensajeModal(data.mensaje);
            break;
          default:
            break;
        }
      });
  }

  useEffect(() => {
    ObtenerTipoTickets();
    ObtenerEstatusTickets();
    ObtenerTicket();
  }, [ObtenerTipoTickets, ObtenerTicket, ObtenerEstatusTickets]);

  useEffect(() => {
    setTipoVacia(!(valorTipo.size > 0));
    setEstatusVacia(!(valorEstatus.size > 0));
  }, [valorTipo, valorEstatus]);

  useEffect(() => {
    if (ticket) {
      setValorTipo(new Set([ticket.tipo_ticket_id.toString()]));
      setValorEstatus(new Set([ticket.estatus_ticket_id.toString()]));
    }
  }, [ticket]);

  return (
    <>
      <Layout usuario={usuario} setUsuario={setUsuario}>
        <Form onSubmit={(ev) => enviarDatos(ev)}>
          {ticket && tipoTickets && estatusTickets ? (
            <div className="flex flex-col gap-9 w-[900px]">
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
              <div className="flex justify-between w-[900px]">
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
        onAccept={() => navigate("/tickets-todos")}
      />
    </>
  );
}

export default EditarTicket;
