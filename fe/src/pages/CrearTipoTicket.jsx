import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, useDisclosure, Form } from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import enviarDatos from "../utils/enviarDatos";

/**
 * CrearTipoTicket permite a usuarios administradores registrar un nuevo tipo de ticket (área de soporte).
 * Protege la ruta, controla feedback modal y asegura validación reactiva.
 */
function CrearTipoTicket() {
  // Estado para feedback modal y control de carga.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado del input y flag de validación.
  const [valorNombre, setValorNombre] = useState("");
  const [nombreVacia, setNombreVacia] = useState(true);

  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Envía el formulario para crear el tipo de ticket.
  const creaTipoTicket = (ev) => {
    enviarDatos({
      ev,
      url: "/CrearTipoTicket",
      metodo: "POST",
      datos: {
        nombre: valorNombre,
      },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  // Protege la ruta: solo accesible para administradores.
  useEffect(() => {
    verificaAdmin(navigate);
  }, []);

  // Valida el campo en tiempo real para UX y control de submit.
  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
  }, [valorNombre]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de áreas de soporte"
        rutaBotonRegresar="/tipo-tickets-todos"
      >
        <Form className="w-full" onSubmit={creaTipoTicket}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Crear un área de soporte
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre del área de soporte"
                isRequired
                variant="flat"
                onChange={(ev) => setValorNombre(ev.target.value)}
                value={valorNombre}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                isDisabled={nombreVacia} // Deshabilita si el campo está vacío.
                isLoading={estaCargando}
              >
                Crear área de soporte
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

export default CrearTipoTicket;
