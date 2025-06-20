import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button, useDisclosure, Form, Switch } from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

function EditarTipoTicket() {
  const [datosTipoTicket, setDatosTipoTicket] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const [valorNombre, setValorNombre] = useState("");
  const [valorSwitch, setValorSwitch] = useState(false);

  const [nombreVacia, setNombreVacia] = useState(true);

  const [usuario, setUsuario] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};

  function obtenerTipoTicket() {
    obtenerDatos({
      url: `/ObtenerTipoTicketPorID/${id}`,
      setDatos: setDatosTipoTicket,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  const editaTipoTicket = (ev) => {
    enviarDatos({
      ev,
      url: "/ActualizarTipoTicket",
      metodo: "PATCH",
      datos: {
        id: datosTipoTicket.id,
        nombre: valorNombre,
        estatus: valorSwitch,
      },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  useEffect(() => {
    verificaAdmin(navigate);
    obtenerTipoTicket();
  }, []);

  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
  }, [valorNombre]);

  useEffect(() => {
    setValorNombre(datosTipoTicket?.nombre || "");
    setValorSwitch(datosTipoTicket?.estatus || false);
  }, [datosTipoTicket]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de áreas de soporte"
        rutaBotonRegresar="/tipo-tickets-todos"
      >
        <Form className="w-full" onSubmit={editaTipoTicket}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Editar área de soporte
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre del área de soporte"
                isRequired
                variant="flat"
                onChange={(ev) => setValorNombre(ev.target.value)}
                value={valorNombre}
              />
              <Switch
                isSelected={valorSwitch}
                onValueChange={setValorSwitch}
                color="success"
              >
                {valorSwitch ? "Activo" : "Inactivo"}
              </Switch>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                isDisabled={nombreVacia}
                isLoading={estaCargando}
              >
                Editar área de soporte
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
            ? () => navigate("/tipo-tickets-todos")
            : null
        }
      />
    </>
  );
}

export default EditarTipoTicket;
