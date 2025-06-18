import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import TablaAreas from "../components/TablaAreas";
import verificaAdmin from "../utils/verificaAdmin";
import obtenerDatos from "../utils/obtenerDatos";

function AreasTodos() {
  const [usuario, setUsuario] = useState(null);
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  const [areasLista, setAreasLista] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  function obtenerAreas() {
    setAreasLista([]);

    obtenerDatos({
      url: "/ObtenerAreas",
      onSuccess: (data) => {
        if (data.datos && data.datos.length > 0) {
          const areasTransformadas = data.datos.map((item) => ({
            ...item,
            estatus: item.estatus ? "Activo" : "Inactivo",
          }));
          setAreasLista(areasTransformadas);
        }
      },
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  useEffect(() => {
    obtenerAreas();
  }, []);

  useEffect(() => {
    verificaAdmin(navigate);
  }, []);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Menú principal"
        rutaBotonRegresar="/dashboard"
      >
        <div className="flex flex-col gap-9 w-full">
          <h2 className="text-institucional text-2xl font-semibold">
            Todos los departamentos
          </h2>
          <span>
            <Button
              className="font-semibold"
              color="success"
              startContent={<FaPlusCircle />}
              onPress={() => navigate("/crear-area")}
            >
              Nuevo departamento
            </Button>
          </span>
          <TablaAreas areasLista={areasLista} navigate={navigate} />
        </div>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
        onAccept={varianteModal === "correcto" ? obtenerAreas : null}
      />
    </>
  );
}

export default AreasTodos;
