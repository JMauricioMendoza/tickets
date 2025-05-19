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
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";

function CrearTicket() {
  const [tipoTickets, setTipoTickets] = useState(null);
  const [areas, setTipoAreas] = useState(null);
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");

  const [valorNombre, setValorNombre] = useState("");
  const [valorDescripcion, setValorDescripcion] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorArea, setValorArea] = useState(new Set([]));

  const [nombreVacia, setNombreVacia] = useState(true);
  const [descripcionVacia, setDescripcionVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);
  const [areaVacia, setAreaVacia] = useState(true);

  const [usuario, setUsuario] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const apiURL = process.env.REACT_APP_API_URL;

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

  const ObtenerAreas = useCallback(() => {
    fetch(`${apiURL}/ObtenerAreaActivos`, {
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
            setTipoAreas(data.areas);
            break;
          default:
            break;
        }
      });
  }, [onOpen]);

  function enviarDatos(ev) {
    ev.preventDefault();

    fetch(`${apiURL}/CrearTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creado_por: valorNombre,
        area_id: parseInt(valorArea.currentKey, 10),
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
            onOpen();
            setVarianteModal("advertencia");
            setMensajeModal(data.mensaje);
            break;
          default:
            break;
        }
      });
  }

  const limpiarInputs = () => {
    setValorNombre("");
    setValorDescripcion("");
    setValorArea(new Set([]));
    setValorTipo(new Set([]));
  };

  useEffect(() => {
    ObtenerTipoTickets();
    ObtenerAreas();
  }, [ObtenerTipoTickets, ObtenerAreas]);

  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
    setDescripcionVacia(verificaVacio(valorDescripcion));
    setTipoVacia(!(valorTipo.size > 0));
    setAreaVacia(!(valorArea.size > 0));
  }, [valorDescripcion, valorTipo, valorArea, valorNombre]);

  return (
    <>
      <Layout usuario={usuario} setUsuario={setUsuario}>
        <Form onSubmit={(ev) => enviarDatos(ev)}>
          <div className="flex flex-col gap-9 w-[900px]">
            <h2 className="text-institucional text-2xl font-semibold">
              Crear un ticket
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre de quien reporta"
                placeholder="Escribe tu nombre completo"
                isRequired
                variant="flat"
                onChange={(ev) => setValorNombre(ev.target.value)}
                value={valorNombre}
              />
              <Select
                label="Área de adscripción"
                isRequired
                selectedKeys={valorArea}
                onSelectionChange={setValorArea}
                variant="flat"
              >
                {areas &&
                  areas.map((item) => (
                    <SelectItem key={item.id}>{item.nombre}</SelectItem>
                  ))}
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
              <div className="row-start-3 row-end-4 col-start-1 col-end-3">
                <Textarea
                  label="Descripción del problema"
                  isRequired
                  variant="flat"
                  onChange={(ev) => setValorDescripcion(ev.target.value)}
                  value={valorDescripcion}
                />
              </div>
            </div>
            <div className="flex justify-end w-[900px]">
              <Button
                type="submit"
                color="primary"
                isDisabled={
                  descripcionVacia || tipoVacia || areaVacia || nombreVacia
                }
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
        onAccept={limpiarInputs}
      />
    </>
  );
}

export default CrearTicket;
