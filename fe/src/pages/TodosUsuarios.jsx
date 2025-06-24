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
 * UsuariosTodos muestra la lista de usuarios activos y permite su gestión.
 * Protege la ruta, transforma datos para visualización y centraliza feedback modal.
 */
function UsuariosTodos() {
  // Estado global de usuario autenticado (para Layout y controles).
  const [usuario, setUsuario] = useState(null);

  // Estado para feedback modal.
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  // Lista de usuarios a mostrar en la tabla.
  const [usuariosLista, setUsuariosLista] = useState([]);

  // Control de modal de feedback.
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  // Carga y transforma los usuarios desde el backend.
  function obtenerUsuariosLista() {
    setUsuariosLista([]); // Limpia antes de cargar para evitar estados inconsistentes.

    obtenerDatos({
      url: "/ObtenerUsuariosActivos",
      onSuccess: (data) => {
        // Transforma el campo administrador a string legible para la tabla.
        if (data.datos && data.datos.length > 0) {
          const usuariosTransformados = data.datos.map((item) => ({
            ...item,
            administrador: item.administrador
              ? "Es administrador"
              : "No es administrador",
          }));
          setUsuariosLista(usuariosTransformados);
        }
      },
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Carga los usuarios al montar el componente.
  useEffect(() => {
    obtenerUsuariosLista();
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
            Todos los usuarios
          </h2>
          <div className="flex gap-5 w-full items-center">
            <Button
              className="font-semibold"
              color="success"
              startContent={<FaPlusCircle />}
              onPress={() => navigate("/crear-usuario")}
            >
              Nuevo usuario
            </Button>
            <Button
              className="font-semibold"
              color="warning"
              onPress={() => navigate("/recuperar-usuario")}
            >
              Recuperar usuario eliminado
            </Button>
          </div>
          <Tabla
            datosLista={usuariosLista}
            navigate={navigate}
            nombreDato="usuario"
            urlEditar="/editar-usuario"
            esUsuario // Prop para renderizado condicional de acciones de usuario.
            usuarioAdminID={usuario?.usuario_id || null} // Para evitar acciones sobre sí mismo.
            onOpen={onOpen}
            setVarianteModal={setVarianteModal}
            setMensajeModal={setMensajeModal}
          />
        </div>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
        // Refresca la lista tras éxito en acciones sobre usuarios.
        onAccept={varianteModal === "correcto" ? obtenerUsuariosLista : null}
      />
    </>
  );
}

export default UsuariosTodos;
