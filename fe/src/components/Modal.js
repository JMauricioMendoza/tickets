import styled from "styled-components";
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
          <IconoError>
            <MdError />
          </IconoError>
        );
      case "advertencia":
        return (
          <IconoAdvertencia>
            <MdWarning />
          </IconoAdvertencia>
        );
      case "correcto":
        return (
          <IconoCorrecto>
            <MdCheckCircle />
          </IconoCorrecto>
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
              <ContenedorEncabezado>
                <p>{getTitulo()}</p>
                {getHeaderIcon()}
              </ContenedorEncabezado>
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

const ContenedorEncabezado = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const IconoError = styled.span`
  color: #f31260;
  font-size: 24px;
`;

const IconoAdvertencia = styled.span`
  color: #f5a524;
  font-size: 24px;
`;

const IconoCorrecto = styled.span`
  color: #17c964;
  font-size: 24px;
`;

export default ModalComp;
