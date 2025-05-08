import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import Login from "./pages/Login";
import MisTickets from "./pages/MisTickets";
import Ticket from "./pages/Ticket";
import Dashboard from "./pages/Dashboard";
import RutaProtegida from "./utils/RutaProtegida";

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RutaProtegida />}>
            <Route path="/mis-tickets" element={<MisTickets />} />
            <Route path="/ticket" element={<Ticket />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </HeroUIProvider>
  );
}

export default App;
