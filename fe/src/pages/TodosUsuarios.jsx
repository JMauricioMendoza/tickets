import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Button } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import TablaUsuarios from "../components/TablaUsuarios";
import verificaAdmin from "../utils/verificaAdmin";
import obtenerDatos from "../utils/obtenerDatos";

function UsuariosTodos() {
  const [usuario, setUsuario] = useState(null);
  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");

  const [usuariosLista, setUsuariosLista] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  function obtenerUsuariosLista() {
    setUsuariosLista([]);

    obtenerDatos({
      url: "/ObtenerUsuariosActivos",
      onSuccess: (data) => {
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

  useEffect(() => {
    obtenerUsuariosLista();
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
          <TablaUsuarios
            usuariosLista={usuariosLista}
            onOpen={onOpen}
            setVarianteModal={setVarianteModal}
            setMensajeModal={setMensajeModal}
            navigate={navigate}
            usuarioAdminID={usuario?.usuario_id || null}
          />
        </div>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
        onAccept={varianteModal === "correcto" ? obtenerUsuariosLista : null}
      />
    </>
  );
}

export default UsuariosTodos;
