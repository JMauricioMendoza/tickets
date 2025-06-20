import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Chip,
  Button,
  Tooltip,
} from "@heroui/react";
import { FaPen, FaKey, FaTrashAlt } from "react-icons/fa";
import enviarDatos from "../utils/enviarDatos";

const columns = [
  {
    key: "nombre",
    label: "NOMBRE",
  },
  {
    key: "estatus",
    label: "ESTATUS",
  },
  {
    key: "acciones",
    label: "ACCIONES",
  },
];

const columnsUsuario = [
  {
    key: "nombre",
    label: "NOMBRE",
  },
  {
    key: "usuario",
    label: "USUARIO",
  },
  {
    key: "administrador",
    label: "ADMINISTRADOR",
  },
  {
    key: "acciones",
    label: "ACCIONES",
  },
];

function Tabla({
  datosLista,
  navigate,
  nombreDato,
  urlEditar,
  esUsuario = false,
  usuarioAdminID,
  onOpen,
  setVarianteModal,
  setMensajeModal,
}) {
  const [estaCargando, setEstaCargando] = useState(false);

  const inhabilitaUsuario = (usuarioID) => {
    enviarDatos({
      url: `/InhabilitarUsuario`,
      metodo: "PATCH",
      datos: { id: usuarioID },
      setEstaCargando,
      navigate,
      onOpen,
      setVarianteModal,
      setMensajeModal,
    });
  };

  const renderCell = (item, columnKey) => {
    if (columnKey === "estatus") {
      return (
        <Chip
          color={item.estatus === "Activo" ? "success" : "danger"}
          variant="flat"
        >
          {item.estatus}
        </Chip>
      );
    }
    if (columnKey === "administrador") {
      return (
        <Chip
          color={
            item.administrador === "Es administrador" ? "success" : "danger"
          }
          variant="flat"
        >
          {item.administrador}
        </Chip>
      );
    }
    if (columnKey === "acciones") {
      return (
        <>
          <Tooltip content={`Editar ${nombreDato}`} closeDelay="0">
            <Button
              variant="light"
              color="primary"
              isIconOnly
              onPress={() => {
                navigate(`${urlEditar}`, {
                  state: { id: item.id },
                });
              }}
            >
              <FaPen />
            </Button>
          </Tooltip>
          {esUsuario && (
            <>
              <Tooltip content="Editar contraseña" closeDelay="0">
                <Button
                  variant="light"
                  color="warning"
                  isIconOnly
                  onPress={() => {
                    navigate("/editar-password", {
                      state: { id: item.id },
                    });
                  }}
                >
                  <FaKey />
                </Button>
              </Tooltip>
              <Tooltip content={`Eliminar ${nombreDato}`} closeDelay="0">
                <Button
                  variant="light"
                  color={item.id === usuarioAdminID ? "default" : "danger"}
                  isIconOnly
                  onPress={() => inhabilitaUsuario(item.id)}
                  isDisabled={item.id === usuarioAdminID}
                  isLoading={estaCargando}
                >
                  <FaTrashAlt />
                </Button>
              </Tooltip>
            </>
          )}
        </>
      );
    }

    return getKeyValue(item, columnKey);
  };

  return (
    <Table aria-label={`Tabla de ${nombreDato}`}>
      <TableHeader columns={esUsuario ? columnsUsuario : columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody
        items={datosLista}
        emptyContent={`No hay ${nombreDato}s disponibles.`}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default Tabla;
