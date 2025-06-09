import { useState, useEffect } from "react";
import { Input, Button, useDisclosure, Form } from "@heroui/react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaDatos from "../utils/verificaDatos";
import verificaVacio from "../utils/verificaVacio";

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

  const apiURL = process.env.REACT_APP_API_URL;

  function enviarDatos(ev) {
    ev.preventDefault();
    setEstaCargando(true);

    fetch(`${apiURL}/IniciarSesion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: valorUsuario,
        password: valorPasswd,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setEstaCargando(false);
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("admin", data.administrador);
            navigate("/dashboard");
            break;
          case 400:
          case 401:
            onOpen();
            setVarianteModal("advertencia");
            setMensajeModal(data.mensaje);
            break;
          default:
            break;
        }
      });
  }

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
      <Form onSubmit={(ev) => enviarDatos(ev)}>
        <div className="flex items-center justify-center flex-col gap-12 w-[400px]">
          <h2 className="text-l text-center font-semibold">
            Inicia sesión como usuario administrador
          </h2>
          <Input
            onChange={(ev) => verificaDatos(ev, setValorUsuario, 0)}
            value={valorUsuario}
            label="Usuario"
            type="text"
            variant="bordered"
            size="sm"
            isRequired
          />
          <Input
            onChange={(ev) => verificaDatos(ev, setValorPasswd, 0)}
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
