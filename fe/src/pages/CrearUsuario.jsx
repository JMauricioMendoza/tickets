import { useState, useEffect, useCallback } from "react";
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
import forzarCierreSesion from "../utils/forzarCierreSesion";
import verificaAdmin from "../utils/verificaAdmin";
import eliminarEspacios from "../utils/eliminarEspacios";

function CrearUsuario() {
  const [tipoTickets, setTipoTickets] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const [valorNombre, setValorNombre] = useState("");
  const [valorUsuario, setValorUsuario] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorPassword, setValorPassword] = useState("");
  const [valorSwitch, setValorSwitch] = useState(false);

  const [nombreVacia, setNombreVacia] = useState(true);
  const [usuarioVacia, setUsuarioVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);
  const [passwordVacia, setPaswordVacia] = useState(true);

  const [usuario, setUsuario] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  const apiURL = process.env.REACT_APP_API_URL;

  function enviarDatos(ev) {
    ev.preventDefault();
    estaCargando(true);

    fetch(`${apiURL}/CrearUsuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        nombre: valorNombre,
        password: valorPassword,
        usuario: valorUsuario,
        administrador: valorSwitch,
        tipo_ticket_id: Array.from(valorTipo, Number),
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setEstaCargando(false);
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
          case 409:
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

  useEffect(() => {
    verificaAdmin(navigate);
    ObtenerTipoTickets();
  }, []);

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
        <Form className="w-full" onSubmit={(ev) => enviarDatos(ev)}>
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
