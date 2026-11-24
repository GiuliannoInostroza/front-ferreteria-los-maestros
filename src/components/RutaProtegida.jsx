import { Navigate, Outlet } from "react-router-dom";

export default function RutaProtegida({ rol, excluirVendedor = false }) {
  const texto = sessionStorage.getItem("usuario");
  const usuario = texto ? JSON.parse(texto) : null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (excluirVendedor && usuario.rol === "Vendedor") {
    return <Navigate to="/admin/productos" replace />;
  }
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />;
  return <Outlet />;
}
