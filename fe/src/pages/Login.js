import { useState, useEffect } from "react";
import { Input, Button, useDisclosure, Form } from "@heroui/react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModalComp from "../components/Modal";
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  function IniciarSesion(ev) {
    ev.preventDefault();

    fetch("http://localhost:8080/IniciarSesion", {
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
        switch (data.status) {
          case 500:
            onOpen();
            setVarianteModal("error");
            break;
          case 200:
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("admin", data.administrador);
            navigate(data.administrador ? "/dashboard" : "/mis-tickets");
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
      const admin = sessionStorage.getItem("admin");
      navigate(admin === "true" ? "/dashboard" : "/mis-tickets");
    }
  }, []);

  return (
    <Layout>
      <Form onSubmit={(ev) => IniciarSesion(ev)}>
        <div className="flex items-center justify-center flex-col gap-7 w-72">
          <h2 className="text-xl font-semibold">Inicia sesión</h2>
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
