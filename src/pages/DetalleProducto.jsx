import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

import { cargarCatalogo } from "../services/catalogoService";
import { mensajeAgregado } from "../utils/mensajes";
import { formatearPrecio } from "../utils/precio";

function DetalleProducto({ onAgregar }) {
  const { codigo } = useParams();
  const [mensaje, setMensaje] = useState("");

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        const catalogo = await cargarCatalogo();
        setProductos(catalogo.productos);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <Spinner aria-label="Cargando productos" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const producto = productos.find((item) => item.codigo === codigo);

  if (!producto) {
    return (
      <Container className="py-4">
        <p>El producto solicitado no existe.</p>
        <Link to="/productos">Volver a productos</Link>
      </Container>
    );
  }

  function agregar() {
    onAgregar(producto);
    setMensaje(mensajeAgregado(producto));
  }

  return (
    <Container className="py-4">
      <article className="card">
        <div className="card-body">
          <p className="text-secondary">{producto.categoria}</p>
          <h1>{producto.nombre}</h1>
          <p>{producto.descripcion}</p>
          <p>
            <strong>Marca:</strong> {producto.marca}
          </p>
          <p>
            <strong>Stock:</strong> {producto.stock}
          </p>
          <h2>{formatearPrecio(producto.precio)}</h2>

          {producto.stock === 0 && (
            <p className="text-danger fw-bold">Sin stock</p>
          )}
          {producto.stock > 0 && producto.stock <= producto.stockCritico && (
            <p className="text-warning fw-bold">¡Últimas unidades!</p>
          )}

          <button
            className="btn btn-warning me-2"
            onClick={agregar}
            disabled={producto.stock <= 0}
          >
            Añadir al carrito
          </button>

          <Link className="btn btn-outline-light" to="/productos">
            Volver
          </Link>

          {mensaje && <p className="text-success fw-bold mt-3">{mensaje}</p>}
        </div>
      </article>
    </Container>
  );
}

export default DetalleProducto;
