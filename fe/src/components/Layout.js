import { styled, css } from "styled-components";
import Encabezado from "./Encabezado";

function Layout({ children, usuario, setUsuario }) {
  return (
    <LayoutDiv>
      <ContenedorPrincipal $usuario={usuario}>
        <Encabezado usuario={usuario} setUsuario={setUsuario} />
        {children}
      </ContenedorPrincipal>
    </LayoutDiv>
  );
}

const LayoutDiv = styled.div`
  align-items: start;
  background-color: #e5e7e9;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
`;

const ContenedorPrincipal = styled.div`
  align-items: center;
  background-color: #fffffe;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding: ${({ $usuario }) => ($usuario ? "150px 0 50px" : "0")};
  position: relative;
  width: 1080px;

  ${({ $usuario }) =>
    !$usuario &&
    css`
      min-height: 720px;
    `}
`;

export default Layout;
