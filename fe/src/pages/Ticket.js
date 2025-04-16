import {
  useState,
  useEffect,
  useCallback
} from 'react'; 
import { styled } from 'styled-components';
import Layout from "../components/Layout";
import ModalComp from '../components/Modal';
import verificaVacio from '../utils/verificaVacio';
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  useDisclosure,
  Form
} from "@heroui/react";
  
function Ticket () {
  const[usuario, setUsuario] = useState(null);
  const[tipoTickets, setTipoTickets] = useState(null);
  const[mensajeModal, setMensajeModal] = useState('');
  const[valorUbicacion, setValorUbicacion] = useState('');
  const[valorDescripcion, setValorDescripcion] = useState('');
  const[valorTipo, setValorTipo] = useState(new Set([]));
  
  const[descripcionVacia, setDescripcionVacia] = useState(true);
  const[tipoVacia, setTipoVacia] = useState(true);

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const ObtenerTipoTickets = useCallback ( () => {
    fetch('http://localhost:8080/ObtenerTipoTicketsActivos', {
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
          setTipoTickets(data.tipoTickets);
          break;
        case 401:
          sessionStorage.removeItem("token");
          window.location.href = "/login";
          break;
        default:
          break;
      }
    });
  }, [onOpen]);

  function enviarDatos (ev) {
    ev.preventDefault();
    
    fetch('http://localhost:8080/CrearTicket', {
      method: "POST",
      headers: {
          "Authorization": "Bearer " + sessionStorage.getItem("token"),
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          "usuario_id": usuario.usuarioId,
          "ubicacion": valorUbicacion,
          "tipo_ticket_id" : parseInt(valorTipo.currentKey, 10),
          "descripcion" : valorDescripcion
      })
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    switch (data.status) {
      case 500:
        console.error(data.mensaje);
      break;
      case 201:
        TicketCreado();
      break;
      case 400:
      case 401:
        onOpen();
        setMensajeModal(data.mensaje);
      break;
      default:
      break;
    }
  });
  };

  function TicketCreado () {
    
  };

  useEffect(() => {
    ObtenerTipoTickets();
  }, [ObtenerTipoTickets]);

  useEffect(() => {
    setDescripcionVacia(verificaVacio(valorDescripcion));
    setTipoVacia(valorTipo.size > 0 ? false: true);
  }, [valorDescripcion, valorTipo]);
  
  return(
    <>
    <Layout
      usuario={usuario}
      setUsuario={setUsuario}
    >   <Form onSubmit={ev => enviarDatos(ev)}>
        <ContenedorPrincipal>
            <Titulo>Crear un ticket</Titulo>
            <ContenedorInputs>
                {usuario ?
                <>
                <Input
                  label='Usuario'
                  isReadOnly
                  defaultValue={usuario.nombre}
                  isRequired
                  variant="flat"
                />
                <Input
                  label='Area'
                  isReadOnly
                  defaultValue={usuario.area}
                  isRequired
                  variant="flat"
                />
                </>
                : null}
                <Select label='Área de soporte' isRequired selectedKeys={valorTipo} onSelectionChange={setValorTipo} variant="flat">
                  {tipoTickets && tipoTickets.map((item) => (
                    <SelectItem key={item.id}>{item.nombre}</SelectItem>
                  ))}
                </Select>
                <Input
                  label='Ubicación (opcional):'
                  placeholder="Ej. Mesa de atención 5"
                  onChange={(ev) => setValorUbicacion(ev.target.value)}
                  variant="flat"
                />
                <ContenedorTextArea>
                <Textarea
                  label='Descripción'
                  isRequired
                  variant="flat"
                  onChange={(ev) => setValorDescripcion(ev.target.value)}
                />
                </ContenedorTextArea>
                
            </ContenedorInputs>
            <ContenedorBotones>              
              <Button type='button' color='danger' variant='light' onPress={() => window.location.replace('/Inicio')}>Cancelar</Button>
              <Button type='submit' color='primary' isDisabled={descripcionVacia || tipoVacia}>Solicitar soporte</Button>
            </ContenedorBotones>
        </ContenedorPrincipal>
        </Form>
      </Layout>
      <ModalComp
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        mensaje={mensajeModal}
      />
      <ModalComp
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="error" 
        mensaje="Hubo un problema al guardar la información."
      />
      </>
    );
  };
  
export default Ticket;

const Titulo = styled.h2`
  color: #9d2348;
  font-size: 24px;
  font-weight: 600;
`;

const ContenedorPrincipal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 35px;
  width: 900px;
`;

const ContenedorInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 35px;
  grid-row-gap: 50px;
`;

const ContenedorTextArea = styled.div`
  grid-area: 3 / 1 / 4 / 3;
`;

const ContenedorBotones = styled.div`
  display: flex;
  justify-content: space-between;
  width: 900px;
`;