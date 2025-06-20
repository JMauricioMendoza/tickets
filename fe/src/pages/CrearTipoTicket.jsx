import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, useDisclosure, Form } from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import enviarDatos from "../utils/enviarDatos";

function CrearTipoTicket() {
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const [valorNombre, setValorNombre] = useState("");

  const [nombreVacia, setNombreVacia] = useState(true);

  const [usuario, setUsuario] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

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

  useEffect(() => {
    verificaAdmin(navigate);
  }, []);

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
                isDisabled={nombreVacia}
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
