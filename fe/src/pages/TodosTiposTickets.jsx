import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import Tabla from "../components/Tabla";
import verificaAdmin from "../utils/verificaAdmin";
import obtenerDatos from "../utils/obtenerDatos";

function TipoTicketsTodos() {
  const [usuario, setUsuario] = useState(null);
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  const [tipoTicketsLista, setTipoTicketsLista] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  function obtenerTipoTickets() {
    setTipoTicketsLista([]);

    obtenerDatos({
      url: "/ObtenerTipoTickets",
      onSuccess: (data) => {
        if (data.datos && data.datos.length > 0) {
          const tipoTicketsTransformados = data.datos.map((item) => ({
            ...item,
            estatus: item.estatus ? "Activo" : "Inactivo",
          }));
          setTipoTicketsLista(tipoTicketsTransformados);
        }
      },
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  useEffect(() => {
    obtenerTipoTickets();
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
            Todos las áreas de soporte
          </h2>
          <span>
            <Button
              className="font-semibold"
              color="success"
              startContent={<FaPlusCircle />}
              onPress={() => navigate("/crear-tipo-ticket")}
            >
              Nueva área de soporte
            </Button>
          </span>
          <Tabla
            datosLista={tipoTicketsLista}
            navigate={navigate}
            nombreDato="área de soporte"
            urlEditar="/editar-tipo-ticket"
          />
        </div>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </>
  );
}

export default TipoTicketsTodos;
