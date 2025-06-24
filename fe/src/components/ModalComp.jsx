import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { MdError, MdWarning, MdCheckCircle } from "react-icons/md";

/**
 * ModalComp centraliza la visualización de mensajes modales de feedback.
 * Permite mostrar distintos íconos y títulos según el tipo de mensaje (error, advertencia, éxito).
 * onAccept permite ejecutar lógica adicional al cerrar (ej: limpiar formularios tras éxito).
 */
function ModalComp({
  isOpen,
  onOpenChange,
  variant,
  mensaje,
  titulo = "",
  onAccept,
}) {
  // Selecciona el ícono del encabezado según el tipo de mensaje.
  const getHeaderIcon = () => {
    switch (variant) {
      case "error":
        return (
          <span className="text-danger text-2xl">
            <MdError />
          </span>
        );
      case "advertencia":
        return (
          <span className="text-warning text-2xl">
            <MdWarning />
          </span>
        );
      case "correcto":
        return (
          <span className="text-success text-2xl">
            <MdCheckCircle />
          </span>
        );
      default:
        return null;
    }
  };

  // Determina el título del modal según el tipo de mensaje.
  const getTitulo = () => {
    switch (variant) {
      case "error":
        return "Error";
      case "advertencia":
        return "Advertencia";
      case "correcto":
        return "Proceso exitoso";
      default:
        return titulo;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-6">
                <p>{getTitulo()}</p>
                {getHeaderIcon()}
              </div>
            </ModalHeader>
            <ModalBody>
              <p>{mensaje}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
                  // Permite ejecutar lógica adicional antes de cerrar el modal.
                  if (onAccept) onAccept();
                  onClose();
                }}
              >
                Aceptar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ModalComp;
