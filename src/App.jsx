import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Navegacion from "./components/Navegacion";
import PiePagina from "./components/PiePagina";
import SinAcceso from "./components/SinAcceso";
import RutaProtegida from "./components/RutaProtegida";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Categorias from "./pages/Categorias";
import Ofertas from "./pages/Ofertas";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Nosotros from "./pages/Nosotros";
import Blogs from "./pages/Blogs";
import BlogDetalle from "./pages/BlogDetalle";
import Contacto from "./pages/Contacto";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import GestionPedidos from "./pages/admin/GestionPedidos";
import MisPedidos from "./pages/MisPedidos";
import NoEncontrada from "./pages/NoEncontrada";

import {
  agregarProducto,
  contarUnidades,
  modificarCantidad,
  quitarProducto,
} from "./utils/carrito";
import { guardarCarrito, leerCarrito } from "./utils/persistencia";
import { puedeAdministrar } from "./utils/sesion";
import UsuarioForm from "./pages/admin/UsuarioForm";

function App() {
  const [carrito, setCarrito] = useState(() => leerCarrito());
  const [usuario, setUsuario] = useState(() => {
    const texto = sessionStorage.getItem("usuario");
    return texto ? JSON.parse(texto) : null;
  });

  useEffect(() => {
    guardarCarrito(carrito);
  }, [carrito]);

  function agregarAlCarrito(producto) {
    setCarrito(agregarProducto(carrito, producto));
  }

  function cambiarCantidad(codigo, cambio) {
    setCarrito(modificarCantidad(carrito, codigo, cambio));
  }

  function quitarDelCarrito(codigo) {
    setCarrito(quitarProducto(carrito, codigo));
  }

  function vaciarCarrito() {
    setCarrito([]);
  }

  function cerrarSesion() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navegacion unidades={contarUnidades(carrito)} usuario={usuario} />

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route
            path="/productos"
            element={<Productos onAgregar={agregarAlCarrito} />}
          />
          <Route
            path="/productos/:codigo"
            element={<DetalleProducto onAgregar={agregarAlCarrito} />}
          />
          <Route
            path="/carrito"
            element={
              <Carrito
                carrito={carrito}
                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitarDelCarrito}
              />
            }
          />
          <Route element={<RutaProtegida />}>
            <Route
              path="/checkout"
              element={
                <Checkout
                  carrito={carrito}
                  usuario={usuario}
                  onVaciar={vaciarCarrito}
                />
              }
            />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
          </Route>
          <Route
            path="/categorias"
            element={<Categorias onAgregar={agregarAlCarrito} />}
          />
          <Route
            path="/ofertas"
            element={<Ofertas onAgregar={agregarAlCarrito} />}
          />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetalle />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route
            path="/login"
            element={
              <Login
                usuario={usuario}
                onIngresar={setUsuario}
                onSalir={cerrarSesion}
              />
            }
          />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/admin/productos"
            element={
              puedeAdministrar(usuario) ? <AdminProductos /> : <SinAcceso />
            }
          />
          <Route
            path="/admin/pedidos"
            element={
              puedeAdministrar(usuario) ? <GestionPedidos /> : <SinAcceso />
            }
          />
          <Route element={<RutaProtegida rol="Administrador" />}>
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/usuarios/nuevo" element={<UsuarioForm />} />
            <Route path="/admin/usuarios/:id/editar" element={<UsuarioForm />} />
          </Route>
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </div>

      <PiePagina />
    </div>
  );
}

export default App;
