import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button, Form, useDisclosure } from "@heroui/react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import eliminarEspacios from "../utils/eliminarEspacios";
import enviarDatos from "../utils/enviarDatos";

function EditarPassword() {
  const [valorPassword, setValorPassword] = useState("");
  const [valorPassword2, setValorPassword2] = useState("");
  const [esPasswordVisible, setEsPasswordVisible] = useState(false);
  const [esPassword2Visible, setEsPassword2Visible] = useState(false);
  const [passwordsIguales, setPasswordsIguales] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [varianteModal, setVarianteModal] = useState("");
  const [mensajeModal, setMensajeModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};

  useEffect(() => {
    setPasswordsIguales(valorPassword === valorPassword2);
  }, [valorPassword, valorPassword2]);

  const editaPassword = (ev) => {
    enviarDatos({
      ev,
      url: "/CambiarPassword",
      metodo: "PATCH",
      datos: { id, password: valorPassword },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        textoBotonRegresar="Menú principal"
        rutaBotonRegresar="/dashboard"
      >
        <Form className="w-full" onSubmit={editaPassword}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Editar contraseña
            </h2>
            <div className="flex flex-col gap-8 w-1/2">
              <Input
                label="Nueva contraseña"
                isRequired
                variant="flat"
                onChange={(ev) => eliminarEspacios(ev, setValorPassword)}
                value={valorPassword}
                type={esPasswordVisible ? "text" : "password"}
                errorMessage="La contraseña debe tener al menos 6 caracteres"
                isInvalid={
                  valorPassword.length < 6 && !verificaVacio(valorPassword)
                }
                endContent={
                  <button
                    className="self-center text-gray-700 text-xl"
                    type="button"
                    onClick={() => setEsPasswordVisible(!esPasswordVisible)}
                  >
                    {esPasswordVisible ? <IoMdEyeOff /> : <IoMdEye />}
                  </button>
                }
              />
              <Input
                label="Confirmar contraseña"
                isRequired
                variant="flat"
                onChange={(ev) => eliminarEspacios(ev, setValorPassword2)}
                value={valorPassword2}
                type={esPassword2Visible ? "text" : "password"}
                isInvalid={!passwordsIguales && !verificaVacio(valorPassword2)}
                errorMessage="Las contraseñas no coinciden"
                endContent={
                  <button
                    className="self-center text-gray-700 text-xl"
                    type="button"
                    onClick={() => setEsPassword2Visible(!esPassword2Visible)}
                  >
                    {esPassword2Visible ? <IoMdEyeOff /> : <IoMdEye />}
                  </button>
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                isDisabled={
                  !passwordsIguales ||
                  verificaVacio(valorPassword) ||
                  verificaVacio(valorPassword2) ||
                  valorPassword.length < 6
                }
                isLoading={estaCargando}
              >
                Editar contraseña
              </Button>
            </div>
          </div>
        </Form>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
        onAccept={
          varianteModal === "correcto" ? () => navigate("/dashboard") : null
        }
      />
    </>
  );
}

export default EditarPassword;
