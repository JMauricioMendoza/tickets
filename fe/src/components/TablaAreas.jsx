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
import { FaPen } from "react-icons/fa";

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

function TablaUsuarios({ areasLista, navigate }) {
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

    if (columnKey === "acciones") {
      return (
        <Tooltip content="Editar departamento" closeDelay="0">
          <Button
            variant="light"
            color="primary"
            isIconOnly
            onPress={() => {
              navigate("/editar-area", {
                state: { id: item.id },
              });
            }}
          >
            <FaPen />
          </Button>
        </Tooltip>
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
        items={areasLista}
        emptyContent="No hay departamentos disponibles."
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
