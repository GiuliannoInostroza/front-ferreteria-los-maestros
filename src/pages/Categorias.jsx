import { useEffect, useState } from "react";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";

import TarjetaProducto from "../components/TarjetaProducto";
import { cargarCatalogo } from "../services/catalogoService";
import { productosDeCategoria } from "../utils/catalogo";
import { mensajeAgregado } from "../utils/mensajes";

function Categorias({ onAgregar }) {
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        const catalogo = await cargarCatalogo();
        setProductos(catalogo.productos);
        setCategorias(catalogo.categorias);
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

  function agregar(producto) {
    onAgregar(producto);
    setMensaje(mensajeAgregado(producto));
  }

  return (
    <Container className="py-4">
      <h1>Categorías</h1>

      {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

      {categorias.map((categoria) => (
        <section className="my-4" key={categoria}>
          <h2 className="h4 mb-3">{categoria}</h2>

          <Row className="g-4">
            {productosDeCategoria(productos, categoria).map((producto) => (
              <Col xs={12} md={6} lg={4} key={producto.codigo}>
                <TarjetaProducto producto={producto} onAgregar={agregar} />
              </Col>
            ))}
          </Row>
        </section>
      ))}
    </Container>
  );
}

export default Categorias;
