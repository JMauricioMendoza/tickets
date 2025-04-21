import {
  useState,
  useEffect
} from 'react';
import Layout from '../components/Layout';
import ModalComp from '../components/Modal';
import verificaDatos from '../utils/verificaDatos';
import verificaVacio from '../utils/verificaVacio';
import {
  Input,
  Button,
  useDisclosure,
  Form
} from "@heroui/react";
import { styled } from 'styled-components';
import {
  IoMdEye,
  IoMdEyeOff
} from "react-icons/io";

function Login () {
  const [valorUsuario, setValorUsuario] = useState('');
  const [valorPasswd, setValorPasswd] = useState('');
  const [usuarioVacio, setUsuarioVacio] = useState(true);
  const [passwdVacio, setPasswdVacio] = useState(true);
  const [esVisible, setEsVisible] = useState(false);
  const[mensajeModal, setMensajeModal] = useState('');
  const[varianteModal, setVarianteModal] = useState('');

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  function IniciarSesion(ev) { 
    ev.preventDefault();

    fetch('http://localhost:8080/IniciarSesion', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "usuario": valorUsuario,
            "password": valorPasswd
        })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      switch (data.status) {
        case 500:
          onOpen();
          setVarianteModal("error");
          console.error(data.mensaje);
        break;
        case 200:
          sessionStorage.setItem("token", data.token);
          window.location.replace('/Inicio');
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
    })
  };

  useEffect(() => {
    setUsuarioVacio(verificaVacio(valorUsuario));
    setPasswdVacio(verificaVacio(valorPasswd));
  }, [valorUsuario, valorPasswd]);

  useEffect(() => {
    if (sessionStorage.getItem("token")) window.location.replace('/inicio')
  }, []);

  return(
    <Layout>
      <Form onSubmit={ev => IniciarSesion(ev)}>
      <ContenedorPrincipal>
        <Titulo>Inicia sesión</Titulo>
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
          type={esVisible? "text" : "password"}
          variant="bordered"
          size="sm"
          isRequired
          endContent={
            <BotonOjo
              type="button"
              onClick={() => setEsVisible(!esVisible)}
            >
              {esVisible ? <IoMdEyeOff /> : <IoMdEye />}
            </BotonOjo>
            }
        />
        <Button type="submit" isDisabled={usuarioVacio || passwdVacio} color="primary">Entrar</Button>
      </ContenedorPrincipal>
      </Form>
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant={varianteModal}
        mensaje={mensajeModal}
      />
    </Layout>
  );
};

const ContenedorPrincipal = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 30px;
  width: 300px;
`;

const Titulo = styled.h2`
  font-size: 20px;
  font-weight: 600;
`;

const BotonOjo = styled.button`
  align-self: center;
  color: #454545;
  font-size: 20px;
`;

export default Login;