import { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";

import { mensajeEliminado, mensajeGuardado } from "../../utils/mensajes";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarCatalogo,
} from "../../services/catalogoService";
import { formatearPrecio } from "../../utils/precio";
import FormularioProducto from "./FormularioProducto";

function AdminProductos({ puedeEliminar = true }) {
  const [listaProductos, setListaProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [hayCambios, setHayCambios] = useState(false);
  const [pendiente, setPendiente] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        const catalogo = await listarCatalogo();
        setListaProductos(catalogo.productos);
        setCategorias(catalogo.categorias);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  function nombreCategoria(categoriaId) {
    const categoria = categorias.find((item) => item.id === categoriaId);
    return categoria ? categoria.nombre : "";
  }

  function conCategoria(producto) {
    return { ...producto, categoria: nombreCategoria(producto.categoriaId) };
  }

  async function guardar(producto) {
    const categoria = categorias.find((item) => item.nombre === producto.categoria);
    const datos = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      marca: producto.marca,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      stockCritico: producto.stockCritico,
      destacado: Boolean(producto.destacado),
      categoriaId: categoria.id,
    };

    try {
      setError("");
      if (productoEditando) {
        const guardado = await actualizarProducto(productoEditando.id, datos);
        setListaProductos(
          listaProductos.map((item) => (item.id === guardado.id ? guardado : item))
        );
      } else {
        const guardado = await crearProducto(datos);
        setListaProductos([...listaProductos, guardado]);
      }
    } catch (e) {
      setError(e.message);
      return;
    }

    setMensaje(mensajeGuardado("Producto", Boolean(productoEditando)));
    setHayCambios(false);

    if (pendiente) {
      setProductoEditando(pendiente);
      setPendiente(null);
      return;
    }

    setProductoEditando(null);
    setMostrarFormulario(false);
  }

  function agregar() {
    setProductoEditando(null);
    setHayCambios(false);
    setMostrarFormulario(true);
    window.scrollTo(0, 0);
  }

  function editar(producto) {
    window.scrollTo(0, 0);

    if (mostrarFormulario && hayCambios) {
      setPendiente(conCategoria(producto));
      return;
    }

    setProductoEditando(conCategoria(producto));
    setMostrarFormulario(true);
  }

  function descartar() {
    setProductoEditando(pendiente);
    setPendiente(null);
    setHayCambios(false);
  }

  function cancelar() {
    setProductoEditando(null);
    setPendiente(null);
    setHayCambios(false);
    setMostrarFormulario(false);
  }

  async function eliminar(producto) {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      setError("");
      await eliminarProducto(producto.id);
    } catch (e) {
      setError(e.message);
      return;
    }

    setListaProductos(listaProductos.filter((item) => item.id !== producto.id));
    setMensaje(mensajeEliminado("Producto"));

    if (productoEditando && productoEditando.id === producto.id) {
      cancelar();
    }
  }

  if (cargando) return <Spinner aria-label="Cargando productos" />;

  return (
    <Container className="py-4">
      <h1>Administración de productos</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

      {!mostrarFormulario && (
        <Button className="mb-4" onClick={agregar}>
          Agregar producto
        </Button>
      )}

      {mostrarFormulario && (
        <section className="bg-body-tertiary rounded p-4 mb-5">
          <h2 className="h4 mb-4">
            {productoEditando ? "Editar producto" : "Agregar producto"}
          </h2>

          {pendiente && (
            <div className="bg-body rounded p-3 mb-4">
              <p className="text-warning mb-2">
                Tienes cambios sin guardar. Presiona Guardar cambios para
                guardarlos o descártalos para editar {pendiente.nombre}.
              </p>
              <Button className="btn-sm" onClick={descartar}>
                Descartar cambios
              </Button>
            </div>
          )}

          <FormularioProducto
            productos={listaProductos}
            categorias={categorias.map((item) => item.nombre)}
            producto={productoEditando}
            onGuardar={guardar}
            onCancelar={cancelar}
            onModificar={() => setHayCambios(true)}
          />
        </section>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th className="d-none d-md-table-cell">Código</th>
              <th>Nombre</th>
              <th className="d-none d-lg-table-cell">Marca</th>
              <th className="d-none d-lg-table-cell">Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th className="d-none d-lg-table-cell">Stock crítico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaProductos.map((producto) => (
              <tr key={producto.id}>
                <td className="d-none d-md-table-cell">{producto.codigo}</td>
                <td>
                  <div>{producto.nombre}</div>
                  <div className="text-secondary small d-lg-none">
                    {producto.marca} - {nombreCategoria(producto.categoriaId)}
                  </div>
                </td>
                <td className="d-none d-lg-table-cell">{producto.marca}</td>
                <td className="d-none d-lg-table-cell">
                  {nombreCategoria(producto.categoriaId)}
                </td>
                <td>{formatearPrecio(producto.precio)}</td>
                <td>{producto.stock}</td>
                <td className="d-none d-lg-table-cell">{producto.stockCritico}</td>
                <td>
                  <div className="d-grid gap-2 d-md-flex">
                    <Button className="btn-sm" onClick={() => editar(producto)}>
                      Editar
                    </Button>
                    {puedeEliminar && (
                      <Button
                        className="btn-sm"
                        onClick={() => eliminar(producto)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

export default AdminProductos;
