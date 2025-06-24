import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button, useDisclosure, Form, Switch } from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * EditarTipoTicket permite a administradores modificar nombre y estatus de un tipo de ticket (área de soporte).
 * Protege la ruta, carga datos dependientes y controla feedback modal.
 */
function EditarTipoTicket() {
  // Estado para los datos actuales del tipo de ticket.
  const [datosTipoTicket, setDatosTipoTicket] = useState(null);

  // Estado para feedback modal y control de carga.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado de los inputs y flag de validación.
  const [valorNombre, setValorNombre] = useState("");
  const [valorSwitch, setValorSwitch] = useState(false);
  const [nombreVacia, setNombreVacia] = useState(true);

  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};

  // Carga los datos del tipo de ticket a editar.
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

  // Envía los cambios al backend.
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

  // Protege la ruta y carga datos al montar.
  useEffect(() => {
    verificaAdmin(navigate);
    obtenerTipoTicket();
  }, []);

  // Valida el campo nombre en tiempo real para UX y control de submit.
  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
  }, [valorNombre]);

  // Sincroniza los inputs con los datos cargados del tipo de ticket.
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
                isDisabled={nombreVacia} // Deshabilita si el campo está vacío.
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
        // Redirige a la lista tras éxito.
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
