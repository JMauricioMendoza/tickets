import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button, useDisclosure, Form, Switch } from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import verificaAdmin from "../utils/verificaAdmin";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

function EditarArea() {
  const [datosArea, setDatosArea] = useState(null);

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

  function ObtenerArea() {
    obtenerDatos({
      url: `/ObtenerAreaPorID/${id}`,
      setDatos: setDatosArea,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  const editaArea = (ev) => {
    enviarDatos({
      ev,
      url: "/ActualizarArea",
      metodo: "PATCH",
      datos: {
        id: datosArea.id,
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
    ObtenerArea();
  }, []);

  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
  }, [valorNombre]);

  useEffect(() => {
    setValorNombre(datosArea?.nombre || "");
    setValorSwitch(datosArea?.estatus || false);
  }, [datosArea]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Lista de departamentos"
        rutaBotonRegresar="/areas-todos"
      >
        <Form className="w-full" onSubmit={editaArea}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Editar departamento
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre del departamento"
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
                Editar departamento
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
          varianteModal === "correcto" ? () => navigate("/areas-todos") : null
        }
      />
    </>
  );
}

export default EditarArea;
