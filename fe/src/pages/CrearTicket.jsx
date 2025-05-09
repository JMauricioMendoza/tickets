import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  useDisclosure,
  Form,
} from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/Modal";
import verificaVacio from "../utils/verificaVacio";

function CrearTicket() {
  const [usuario, setUsuario] = useState(null);
  const [tipoTickets, setTipoTickets] = useState(null);
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");
  const [valorUbicacion, setValorUbicacion] = useState("");
  const [valorDescripcion, setValorDescripcion] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));

  const [descripcionVacia, setDescripcionVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);

  const navigate = useNavigate();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const ObtenerTipoTickets = useCallback(() => {
    fetch("http://localhost:8080/ObtenerTipoTicketsActivos", {
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
            setTipoTickets(data.tipoTickets);
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

    fetch("http://localhost:8080/CrearTicket", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario_id: usuario.usuarioId,
        ubicacion: valorUbicacion,
        tipo_ticket_id: parseInt(valorTipo.currentKey, 10),
        descripcion: valorDescripcion,
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
          case 201:
            onOpen();
            setVarianteModal("correcto");
            setMensajeModal(data.mensaje);
            break;
          case 400:
          case 401:
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
  }, [ObtenerTipoTickets]);

  useEffect(() => {
    setDescripcionVacia(verificaVacio(valorDescripcion));
    setTipoVacia(!(valorTipo.size > 0));
  }, [valorDescripcion, valorTipo]);

  return (
    <>
      <Layout usuario={usuario} setUsuario={setUsuario}>
        <Form onSubmit={(ev) => enviarDatos(ev)}>
          <div className="flex flex-col gap-9 w-[900px]">
            <h2 className="text-institucional text-2xl font-semibold">
              Crear un ticket
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              {usuario ? (
                <>
                  <Input
                    label="Usuario"
                    isReadOnly
                    defaultValue={usuario.nombre}
                    isRequired
                    variant="flat"
                  />
                  <Input
                    label="Area"
                    isReadOnly
                    defaultValue={usuario.area}
                    isRequired
                    variant="flat"
                  />
                </>
              ) : null}
              <Select
                label="Área de soporte"
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
              <Input
                label="Ubicación (opcional):"
                placeholder="Ej. Mesa de atención 5"
                onChange={(ev) => setValorUbicacion(ev.target.value)}
                variant="flat"
              />
              <div className="row-start-3 row-end-4 col-start-1 col-end-3">
                <Textarea
                  label="Descripción"
                  isRequired
                  variant="flat"
                  onChange={(ev) => setValorDescripcion(ev.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between w-[900px]">
              <Button
                type="button"
                color="danger"
                onPress={() => navigate("/mis-tickets")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                isDisabled={descripcionVacia || tipoVacia}
              >
                Solicitar soporte
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
        onAccept={() => navigate("/mis-tickets")}
      />
    </>
  );
}

export default CrearTicket;
