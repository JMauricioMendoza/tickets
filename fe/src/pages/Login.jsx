import { useState, useEffect } from "react";
import { Input, Button, useDisclosure, Form } from "@heroui/react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import eliminarEspacios from "../utils/eliminarEspacios";
import verificaVacio from "../utils/verificaVacio";
import enviarDatos from "../utils/enviarDatos";

function Login() {
  const [valorUsuario, setValorUsuario] = useState("");
  const [valorPasswd, setValorPasswd] = useState("");
  const [usuarioVacio, setUsuarioVacio] = useState(true);
  const [passwdVacio, setPasswdVacio] = useState(true);
  const [esVisible, setEsVisible] = useState(false);

  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  const iniciaSesion = (ev) => {
    enviarDatos({
      ev,
      url: "/IniciarSesion",
      metodo: "POST",
      datos: {
        usuario: valorUsuario,
        password: valorPasswd,
      },
      usarToken: false,
      onSuccess: (data) => {
        sessionStorage.setItem("token", data.datos.token);
        sessionStorage.setItem("admin", data.datos.administrador);
        navigate("/dashboard");
      },
      onUnauthorized: (data) => {
        onOpen();
        setVarianteModal("advertencia");
        setMensajeModal(data.mensaje);
      },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  useEffect(() => {
    setUsuarioVacio(verificaVacio(valorUsuario));
    setPasswdVacio(verificaVacio(valorPasswd));
  }, [valorUsuario, valorPasswd]);

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, []);

  return (
    <Layout>
      <Form onSubmit={iniciaSesion}>
        <div className="flex items-center justify-center flex-col gap-12 w-[400px]">
          <h2 className="text-l text-center font-semibold">
            Inicia sesión como usuario administrador
          </h2>
          <Input
            onChange={(ev) => eliminarEspacios(ev, setValorUsuario)}
            value={valorUsuario}
            label="Usuario"
            type="text"
            variant="bordered"
            size="sm"
            isRequired
          />
          <Input
            onChange={(ev) => eliminarEspacios(ev, setValorPasswd)}
            value={valorPasswd}
            label="Contraseña"
            type={esVisible ? "text" : "password"}
            variant="bordered"
            size="sm"
            isRequired
            endContent={
              <button
                className="self-center text-gray-700 text-xl"
                type="button"
                onClick={() => setEsVisible(!esVisible)}
              >
                {esVisible ? <IoMdEyeOff /> : <IoMdEye />}
              </button>
            }
          />
          <Button
            type="submit"
            isDisabled={usuarioVacio || passwdVacio}
            color="primary"
            isLoading={estaCargando}
          >
            Entrar
          </Button>
        </div>
      </Form>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </Layout>
  );
}

export default Login;
