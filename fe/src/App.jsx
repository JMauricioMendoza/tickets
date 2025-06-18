import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import Login from "./pages/Login";
import CrearTicket from "./pages/CrearTicket";
import EditarTicket from "./pages/EditarTicket";
import Dashboard from "./pages/Dashboard";
import TicketsTodos from "./pages/TicketsTodos";
import UsuariosTodos from "./pages/UsuariosTodos";
import RutaProtegida from "./utils/RutaProtegida";
import CrearUsuario from "./pages/CrearUsuario";
import EditarUsuario from "./pages/EditarUsuario";
import EditarPassword from "./pages/EditarPassword";
import RecuperarUsuario from "./pages/RecuperarUsuario";
import AreasTodos from "./pages/AreasTodos";
import CrearArea from "./pages/CrearArea";
import EditarArea from "./pages/EditarArea";

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Routes>
          <Route path="/crear-ticket" element={<CrearTicket />} />
          <Route path="/login" element={<Login />} />

          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets-todos" element={<TicketsTodos />} />
            <Route path="/editar-ticket" element={<EditarTicket />} />
            <Route path="/usuarios-todos" element={<UsuariosTodos />} />
            <Route path="/crear-usuario" element={<CrearUsuario />} />
            <Route path="/editar-usuario" element={<EditarUsuario />} />
            <Route path="/editar-password" element={<EditarPassword />} />
            <Route path="/recuperar-usuario" element={<RecuperarUsuario />} />
            <Route path="/areas-todos" element={<AreasTodos />} />
            <Route path="/crear-area" element={<CrearArea />} />
            <Route path="/editar-area" element={<EditarArea />} />
          </Route>

          <Route path="*" element={<Navigate to="/crear-ticket" />} />
        </Routes>
      </Router>
    </HeroUIProvider>
  );
}

export default App;
