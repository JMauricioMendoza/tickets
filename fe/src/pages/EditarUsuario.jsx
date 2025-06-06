import { useState, useEffect, useCallback } from "react";
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
import forzarCierreSesion from "../utils/forzarCierreSesion";
import verificaAdmin from "../utils/verificaAdmin";

function EditarUsuario() {
  const [tipoTickets, setTipoTickets] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

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

  const apiURL = process.env.REACT_APP_API_URL;

  const ObtenerUsuario = useCallback(() => {
    fetch(`${apiURL}/ObtenerUsuarioPorID/${id}`, {
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
            setDatosUsuario(data.datos);
            break;
          case 401:
            forzarCierreSesion(navigate);
            break;
          default:
            break;
        }
      });
  }, [onOpen]);

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

  function enviarDatos(ev) {
    ev.preventDefault();

    fetch(`${apiURL}/ActualizarUsuario`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        id: datosUsuario.id,
        nombre: valorNombre,
        usuario: valorUsuario,
        administrador: valorSwitch,
        tipo_ticket_id: Array.from(valorTipo, Number),
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
          case 401:
            forzarCierreSesion(navigate);
            break;
          default:
            break;
        }
      });
  }

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
        <Form className="w-full" onSubmit={(ev) => enviarDatos(ev)}>
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
                onChange={(ev) => setValorUsuario(ev.target.value)}
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
