import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import Tabla from "../components/Tabla";
import verificaAdmin from "../utils/verificaAdmin";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * TipoTicketsTodos muestra la lista de áreas de soporte (tipos de ticket) y permite su gestión.
 * Protege la ruta, transforma datos para visualización y centraliza feedback modal.
 */
function TipoTicketsTodos() {
  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Estado para feedback modal.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  // Lista de tipos de ticket a mostrar en la tabla.
  const [tipoTicketsLista, setTipoTicketsLista] = useState([]);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Carga y transforma los tipos de ticket desde el backend.
  function obtenerTipoTickets() {
    setTipoTicketsLista([]); // Limpia antes de cargar para evitar estados inconsistentes.

    obtenerDatos({
      url: "/ObtenerTipoTickets",
      onSuccess: (data) => {
        // Transforma el campo estatus a string legible para la tabla.
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

  // Carga los tipos de ticket al montar el componente.
  useEffect(() => {
    obtenerTipoTickets();
  }, []);

  // Protege la ruta: solo accesible para administradores.
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
