import {
  useState,
  useEffect,
  useCallback
} from 'react'; 
import { styled } from 'styled-components';
import Layout from "../components/Layout";
import ModalComp from '../components/Modal';
import {
  Alert,
  Button,
  useDisclosure
} from "@heroui/react";
import { AiOutlinePlusCircle } from "react-icons/ai";

function Inicio () {
  const[usuario, setUsuario] = useState(null);
  const[mensajeModal, setMensajeModal] = useState('');
  const[tickets, setTickets] = useState(null);

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const TicketsPorUsuario = useCallback(() => {
    if (!usuario) return;

    fetch(`http://localhost:8080/ObtenerTicketsPorUsuario/${usuario.usuarioId}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("token")
      }
    })
    .then(response => response.json())
    .then(data => {
      switch (data.status) {
        case 500:
          onOpen();
          setMensajeModal("Error");
          console.error(data.mensaje);
          break;
        case 200:
          setTickets(data.tickets);
          break;
        case 401:
          sessionStorage.removeItem("token");
          window.location.href = "/login";
          break;
        default:
          break;
      }
    });
  }, [usuario, onOpen]);

  useEffect(() => {
    TicketsPorUsuario();
  }, [usuario, TicketsPorUsuario]);

  return(
    <>
    <Layout
      usuario={usuario}
      setUsuario={setUsuario}
    >
      <ContenedorPrincipal>
        <Titulo>Mis tickets</Titulo>
        <ContenedorBoton>
          <Button 
            color='success'
            variant='solid'
            startContent={<AiOutlinePlusCircle/>}
            onPress={() => window.location.replace('/Ticket')}
          >
            Nuevo ticket
          </Button>
        </ContenedorBoton>        
        {tickets ? <p>Si</p> : <Alerta/>}
      </ContenedorPrincipal>
    </Layout>
    <ModalComp
      isOpen={isOpen}
      onOpen={onOpen}
      onOpenChange={onOpenChange}
      mensaje={mensajeModal}
    />
    </>
  );
};

function Alerta () {
  return (
    <Alert
      color="warning"
      description="Aún no has creado ningún ticket de soporte. Si necesitas ayuda, inicia uno nuevo para recibir asistencia."
      title="Sin tickets de soporte disponibles"
      variant="faded"
    />
  );
};

const ContenedorPrincipal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 35px;
  width: 900px;
`;

const Titulo = styled.h2`
  color: #9d2348;
  font-size: 24px;
  font-weight: 600;
`;

const ContenedorBoton = styled.div`
  display: flex;
  font-weight: 800;
`;

export default Inicio;