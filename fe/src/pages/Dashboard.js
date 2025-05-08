import { useState } from "react";
import { Card, CardHeader, CardBody, Divider, Link } from "@heroui/react";
import Layout from "../components/Layout";

function Dashboard() {
  const [usuario, setUsuario] = useState(null);

  return (
    <Layout usuario={usuario} setUsuario={setUsuario}>
      <div className="grid grid-cols-2 gap-5 mx-12 w-full">
        <Card>
          <CardHeader>
            <h2 className="pt-2 pl-5 text-institucional text-lg font-semibold">
              Administración
            </h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col gap-2 pb-2 pl-5">
              <Link className="text-base font-medium" href="/tickets-todos">
                Usuarios
              </Link>
              <Link className="text-base font-medium" href="/mis-tickets">
                Departamentos
              </Link>
              <Link className="text-base font-medium" href="/mis-tickets">
                Estatus de tickets
              </Link>
              <Link className="text-base font-medium" href="/mis-tickets">
                Áreas de soporte
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="pt-2 pl-5 text-institucional text-lg font-semibold">
              Gestión de tickets
            </h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col gap-2 pb-2 pl-5">
              <Link className="text-base font-medium" href="/tickets-todos">
                Todos los tickets
              </Link>
              <Link className="text-base font-medium" href="/mis-tickets">
                Mis tickets
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}

export default Dashboard;
