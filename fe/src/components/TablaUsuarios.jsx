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

const columns = [
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

function TablaUsuarios({
  usuariosLista,
  apiURL,
  onOpen,
  setVarianteModal,
  setMensajeModal,
  navigate,
  forzarCierreSesion,
  usuarioAdminID,
}) {
  function inhabilitarUsuario(usuarioID) {
    fetch(`${apiURL}/InhabilitarUsuario`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: usuarioID,
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
            onOpen();
            setVarianteModal("correcto");
            setMensajeModal(data.mensaje);
            break;
          case 400:
            onOpen();
            setVarianteModal("advertencia");
            setMensajeModal(data.mensaje);
            break;
          case 401:
            forzarCierreSesion(navigate);
            break;
          default:
            break;
        }
      });
  }

  const renderCell = (item, columnKey) => {
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
          <Tooltip content="Editar usuario" closeDelay="0">
            <Button
              variant="light"
              color="primary"
              isIconOnly
              onPress={() => {
                navigate("/editar-usuario", {
                  state: { id: item.id },
                });
              }}
            >
              <FaPen />
            </Button>
          </Tooltip>
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
          <Tooltip content="Eliminar usuario" closeDelay="0">
            <Button
              variant="light"
              color={item.id === usuarioAdminID ? "default" : "danger"}
              isIconOnly
              onPress={() => inhabilitarUsuario(item.id)}
              isDisabled={item.id === usuarioAdminID}
            >
              <FaTrashAlt />
            </Button>
          </Tooltip>
        </>
      );
    }

    return getKeyValue(item, columnKey);
  };

  return (
    <Table aria-label="Tabla de usuarios">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody
        items={usuariosLista}
        emptyContent="No hay usuarios disponibles."
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

export default TablaUsuarios;
