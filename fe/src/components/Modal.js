import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { MdError, MdWarning, MdCheckCircle } from "react-icons/md";

function ModalComp({
  isOpen,
  onOpenChange,
  variant,
  mensaje,
  titulo = "",
  onAccept,
}) {
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
              <p>{variant === "error" ? "Error en el servidor." : mensaje}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
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
