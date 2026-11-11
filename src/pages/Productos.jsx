import { useEffect, useState } from "react";
import { Alert, Col, Container, Form, Row, Spinner } from "react-bootstrap";

import TarjetaProducto from "../components/TarjetaProducto";
import { cargarCatalogo } from "../services/catalogoService";
import { mensajeAgregado } from "../utils/mensajes";

function Productos({ onAgregar }) {
  const [categoria, setCategoria] = useState("Todas");
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

  const visibles =
    categoria === "Todas"
      ? productos
      : productos.filter((producto) => producto.categoria === categoria);

  return (
    <Container className="py-4">
      <h1>Nuestros productos</h1>

      <Form.Group className="my-4" controlId="filtro-categoria">
        <Form.Label>Filtrar por categoría</Form.Label>
        <select
          id="filtro-categoria"
          className="form-select"
          value={categoria}
          onChange={(evento) => setCategoria(evento.target.value)}
        >
          <option>Todas</option>
          {categorias.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Form.Group>

      {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

      <Row className="g-4">
        {visibles.map((producto) => (
          <Col xs={12} md={6} lg={4} key={producto.codigo}>
            <TarjetaProducto producto={producto} onAgregar={agregar} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Productos;
