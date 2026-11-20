import { useEffect, useState } from "react";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";

import TarjetaProducto from "../components/TarjetaProducto";
import { cargarCatalogo } from "../services/catalogoService";
import { productosEnOferta } from "../utils/catalogo";
import { mensajeAgregado } from "../utils/mensajes";

function Ofertas({ onAgregar }) {
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

  const ofertas = productosEnOferta(productos);

  function agregar(producto) {
    onAgregar(producto);
    setMensaje(mensajeAgregado(producto));
  }

  return (
    <Container className="py-4">
      <h1>Ofertas</h1>

      {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

      {ofertas.length === 0 && <p>Por ahora no hay productos en oferta.</p>}

      <Row className="g-4">
        {ofertas.map((producto) => (
          <Col xs={12} md={6} lg={4} key={producto.codigo}>
            <TarjetaProducto producto={producto} onAgregar={agregar} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Ofertas;
