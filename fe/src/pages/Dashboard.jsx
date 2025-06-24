import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Link as HeroLink,
} from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import Layout from "../components/Layout";

/**
 * Dashboard muestra accesos rápidos a módulos clave según privilegios.
 * Renderiza secciones administrativas solo si el usuario es admin.
 */
function Dashboard() {
  const [usuario, setUsuario] = useState(null);

  // Determina privilegios de admin desde sessionStorage (persistencia cross-refresh).
  const admin = sessionStorage.getItem("admin");

  return (
    <Layout usuario={usuario} setUsuario={setUsuario}>
      <div className="grid grid-cols-2 gap-5 mx-12 w-full">
        {/* Sección visible solo para administradores */}
        {admin === "true" && (
          <Card>
            <CardHeader>
              <h2 className="pt-2 pl-5 text-institucional text-lg font-semibold">
                Administración
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col gap-2 pb-2 pl-5">
                {/* Accesos rápidos a gestión de usuarios, áreas, estatus y tipos */}
                <HeroLink
                  as={RouterLink}
                  to="/usuarios-todos"
                  className="font-medium"
                >
                  Usuarios
                </HeroLink>
                <HeroLink
                  as={RouterLink}
                  to="/areas-todos"
                  className="font-medium"
                >
                  Departamentos
                </HeroLink>
                <HeroLink
                  as={RouterLink}
                  to="/estatus-todos"
                  className="font-medium"
                >
                  Estatus de tickets
                </HeroLink>
                <HeroLink
                  as={RouterLink}
                  to="/tipo-tickets-todos"
                  className="font-medium"
                >
                  Áreas de soporte
                </HeroLink>
              </div>
            </CardBody>
          </Card>
        )}
        {/* Sección siempre visible: gestión de tickets */}
        <Card>
          <CardHeader>
            <h2 className="pt-2 pl-5 text-institucional text-lg font-semibold">
              Gestión de tickets
            </h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col gap-2 pb-2 pl-5">
              <HeroLink
                as={RouterLink}
                to="/crear-ticket"
                className="font-medium"
              >
                Crear un ticket
              </HeroLink>
              <HeroLink
                as={RouterLink}
                to="/tickets-todos"
                className="font-medium"
              >
                Ver tickets
              </HeroLink>
            </div>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}

export default Dashboard;
