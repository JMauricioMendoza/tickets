import Encabezado from "./Encabezado";

function Layout({ children, usuario, setUsuario }) {
  return (
    <div className="flex items-start justify-center w-full min-h-screen bg-gray-200">
      <div
        className={`relative flex items-center justify-center ${usuario ? "pt-36 pb-12" : "min-h-[720px]"} w-[1080px] bg-white rounded-xl`}
      >
        <Encabezado usuario={usuario} setUsuario={setUsuario} />
        {children}
      </div>
    </div>
  );
}

export default Layout;
