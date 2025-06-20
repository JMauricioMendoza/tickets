import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button, useDisclosure, Form, Switch } from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

function EditarEstatus() {
  const [datosEstatus, setDatosEstatus] = useState(null);

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

  function ObtenerEstatus() {
    obtenerDatos({
      url: `/ObtenerEstatusTicketsPorID/${id}`,
      setDatos: setDatosEstatus,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  const editaEstatus = (ev) => {
    enviarDatos({
      ev,
      url: "/ActualizarEstatusTicket",
      metodo: "PATCH",
      datos: {
        id: datosEstatus.id,
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
    ObtenerEstatus();
  }, []);

  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
  }, [valorNombre]);

  useEffect(() => {
    setValorNombre(datosEstatus?.nombre || "");
    setValorSwitch(datosEstatus?.estatus || false);
  }, [datosEstatus]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de estatus de ticket"
        rutaBotonRegresar="/estatus-todos"
      >
        <Form className="w-full" onSubmit={editaEstatus}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Editar estatus de ticket
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre del estatus de ticket"
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
                Editar estatus de ticket
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
          varianteModal === "correcto" ? () => navigate("/estatus-todos") : null
        }
      />
    </>
  );
}

export default EditarEstatus;
