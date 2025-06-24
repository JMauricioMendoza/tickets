import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaAdmin from "../utils/verificaAdmin";
import obtenerDatos from "../utils/obtenerDatos";
import Tabla from "../components/Tabla";

/**
 * EstatusTodos muestra la lista de estatus de ticket y permite su gestión.
 * Protege la ruta, transforma datos para visualización y centraliza feedback modal.
 */
function EstatusTodos() {
  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Estado para feedback modal.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  // Lista de estatus a mostrar en la tabla.
  const [areasLista, setAreasLista] = useState([]);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Carga y transforma los estatus desde el backend.
  function obtenerEstatus() {
    setAreasLista([]); // Limpia antes de cargar para evitar estados inconsistentes.

    obtenerDatos({
      url: "/ObtenerEstatusTickets",
      onSuccess: (data) => {
        // Transforma el campo estatus a string legible para la tabla.
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

  // Carga los estatus al montar el componente.
  useEffect(() => {
    obtenerEstatus();
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
            Todos los estatus de ticket
          </h2>
          <span>
            <Button
              className="font-semibold"
              color="success"
              startContent={<FaPlusCircle />}
              onPress={() => navigate("/crear-estatus")}
            >
              Nuevo estatus de ticket
            </Button>
          </span>
          <Tabla
            datosLista={areasLista}
            navigate={navigate}
            nombreDato="estatus de ticket"
            urlEditar="/editar-estatus"
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

export default EstatusTodos;
