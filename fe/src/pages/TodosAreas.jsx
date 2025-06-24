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
 * AreasTodos muestra la lista de departamentos (áreas) y permite su gestión.
 * Protege la ruta, transforma datos para visualización y centraliza feedback modal.
 */
function AreasTodos() {
  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Estado para feedback modal.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  // Lista de áreas a mostrar en la tabla.
  const [areasLista, setAreasLista] = useState([]);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Carga y transforma las áreas desde el backend.
  function obtenerAreas() {
    setAreasLista([]); // Limpia antes de cargar para evitar estados inconsistentes.

    obtenerDatos({
      url: "/ObtenerAreas",
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

  // Carga las áreas al montar el componente.
  useEffect(() => {
    obtenerAreas();
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
          <Tabla
            datosLista={areasLista}
            navigate={navigate}
            nombreDato="departamento"
            urlEditar="/editar-area"
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

export default AreasTodos;
