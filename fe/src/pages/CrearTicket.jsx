import { useState, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  useDisclosure,
  Form,
} from "@heroui/react";
import Layout from "../components/Layout";
import ModalComp from "../components/ModalComp";
import verificaVacio from "../utils/verificaVacio";
import enviarDatos from "../utils/enviarDatos";
import obtenerDatos from "../utils/obtenerDatos";

/**
 * Componente para la creación de tickets públicos.
 * Maneja validación de campos, carga dinámica de áreas y tipos, y feedback modal.
 */
function CrearTicket() {
  // Estado para catálogos de tipos de ticket y áreas de adscripción.
  const [tipoTickets, setTipoTickets] = useState(null);
  const [areas, setTipoAreas] = useState(null);

  // Estado para mensajes y variantes del modal de feedback.
  const [mensajeModal, setMensajeModal] = useState("");
  const [varianteModal, setVarianteModal] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado de los inputs del formulario.
  const [valorNombre, setValorNombre] = useState("");
  const [valorDescripcion, setValorDescripcion] = useState("");
  const [valorTipo, setValorTipo] = useState(new Set([]));
  const [valorArea, setValorArea] = useState(new Set([]));

  // Flags de validación para habilitar/deshabilitar el botón de submit.
  const [nombreVacia, setNombreVacia] = useState(true);
  const [descripcionVacia, setDescripcionVacia] = useState(true);
  const [tipoVacia, setTipoVacia] = useState(true);
  const [areaVacia, setAreaVacia] = useState(true);

  // Estado para usuario autenticado (si aplica, permite navegación condicional).
  const [usuario, setUsuario] = useState(null);

  // Hook de control de modal (de HeroUI).
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Carga tipos de ticket activos desde la API.
  function ObtenerTipoTickets() {
    obtenerDatos({
      url: "/ObtenerTipoTicketsActivos",
      usarToken: false,
      setDatos: setTipoTickets,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Carga áreas activas desde la API.
  function ObtenerAreas() {
    obtenerDatos({
      url: "/ObtenerAreasActivos",
      usarToken: false,
      setDatos: setTipoAreas,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  }

  // Envía el formulario para crear un ticket.
  // El backend espera los IDs como enteros y el nombre como string.
  const creaTicket = (ev) => {
    enviarDatos({
      ev,
      url: "/CrearTicket",
      metodo: "POST",
      datos: {
        creado_por: valorNombre,
        area_id: parseInt(valorArea.currentKey, 10),
        tipo_ticket_id: parseInt(valorTipo.currentKey, 10),
        descripcion: valorDescripcion,
      },
      usarToken: false,
      setEstaCargando,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  // Limpia los campos del formulario tras éxito.
  const limpiarInputs = () => {
    setValorNombre("");
    setValorDescripcion("");
    setValorArea(new Set([]));
    setValorTipo(new Set([]));
  };

  // Carga catálogos al montar el componente.
  useEffect(() => {
    ObtenerTipoTickets();
    ObtenerAreas();
  }, []);

  // Valida campos en tiempo real para UX y control de submit.
  useEffect(() => {
    setNombreVacia(verificaVacio(valorNombre));
    setDescripcionVacia(verificaVacio(valorDescripcion));
    setTipoVacia(!(valorTipo.size > 0));
    setAreaVacia(!(valorArea.size > 0));
  }, [valorDescripcion, valorTipo, valorArea, valorNombre]);

  return (
    <>
      <Layout
        usuario={usuario}
        setUsuario={setUsuario}
        // Si hay usuario autenticado, muestra botón para regresar al dashboard.
        textoBotonRegresar={usuario ? "Menú principal" : null}
        rutaBotonRegresar={usuario ? "/dashboard" : null}
      >
        <Form className="w-full" onSubmit={creaTicket}>
          <div className="flex flex-col gap-9 w-full">
            <h2 className="text-institucional text-2xl font-semibold">
              Crear un ticket
            </h2>
            <div className="grid grid-cols-2 gap-x-9 gap-y-12">
              <Input
                label="Nombre de quien reporta"
                placeholder="Escribe tu nombre completo"
                isRequired
                variant="flat"
                onChange={(ev) => setValorNombre(ev.target.value)}
                value={valorNombre}
              />
              <Select
                label="Área de adscripción"
                isRequired
                selectedKeys={valorArea}
                onSelectionChange={setValorArea}
                variant="flat"
              >
                {/* Renderiza áreas activas dinámicamente */}
                {areas &&
                  areas.map((item) => (
                    <SelectItem key={item.id}>{item.nombre}</SelectItem>
                  ))}
              </Select>
              <Select
                label="Área de soporte solicitada"
                isRequired
                selectedKeys={valorTipo}
                onSelectionChange={setValorTipo}
                variant="flat"
              >
                {/* Renderiza tipos de ticket activos dinámicamente */}
                {tipoTickets &&
                  tipoTickets.map((item) => (
                    <SelectItem key={item.id}>{item.nombre}</SelectItem>
                  ))}
              </Select>
              <div className="row-start-3 row-end-4 col-start-1 col-end-3">
                <Textarea
                  label="Descripción del problema"
                  isRequired
                  variant="flat"
                  onChange={(ev) => setValorDescripcion(ev.target.value)}
                  value={valorDescripcion}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                // El botón se deshabilita si algún campo requerido está vacío.
                isDisabled={
                  descripcionVacia || tipoVacia || areaVacia || nombreVacia
                }
                isLoading={estaCargando}
              >
                Solicitar soporte
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
        // Limpia el formulario solo si el modal indica éxito.
        onAccept={varianteModal === "correcto" ? limpiarInputs : null}
      />
    </>
  );
}

export default CrearTicket;
