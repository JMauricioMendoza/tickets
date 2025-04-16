import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {HeroUIProvider} from "@heroui/system";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Ticket from "./pages/Ticket";
import RutaProtegida from "./utils/RutaProtegida";

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RutaProtegida />}>
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/ticket" element={<Ticket />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </HeroUIProvider>
  );
}

export default App;