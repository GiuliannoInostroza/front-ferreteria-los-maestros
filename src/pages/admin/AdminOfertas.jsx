import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";

import {
  crearOferta,
  eliminarOferta,
  listarCatalogo,
} from "../../services/catalogoService";
import { precioConOferta } from "../../utils/catalogo";
import { formatearMonto } from "../../utils/precio";

const inicial = { productoId: "", porcentaje: "" };

function AdminOfertas() {
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        const catalogo = await listarCatalogo();
        setProductos(catalogo.productos);
        setOfertas(catalogo.ofertas);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  function buscarProducto(productoId) {
    return productos.find((item) => item.id === productoId);
  }

  async function crear(evento) {
    evento.preventDefault();

    const nuevosErrores = {};
    if (datos.productoId === "") {
      nuevosErrores.productoId = "Elige un producto";
    }
    if (!(Number(datos.porcentaje) >= 1 && Number(datos.porcentaje) <= 90)) {
      nuevosErrores.porcentaje = "El porcentaje debe estar entre 1 y 90";
    }
    setErrores(nuevosErrores);
    if (nuevosErrores.productoId || nuevosErrores.porcentaje) return;

    try {
      setError("");
      const creada = await crearOferta({
        productoId: Number(datos.productoId),
        porcentaje: Number(datos.porcentaje),
      });
      setOfertas([...ofertas, creada]);
      setMensaje("Oferta creada correctamente");
      setDatos(inicial);
    } catch (e) {
      setError(e.message);
    }
  }

  async function quitar(oferta) {
    if (!window.confirm("¿Quitar esta oferta?")) return;

    try {
      setError("");
      await eliminarOferta(oferta.id);
      setOfertas(ofertas.filter((item) => item.id !== oferta.id));
      setMensaje("Oferta eliminada correctamente");
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <Spinner aria-label="Cargando ofertas" />;

  return (
    <Container className="py-4">
      <h1>Administración de ofertas</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

      <section className="bg-body-tertiary rounded p-4 mb-4">
        <h2 className="h4 mb-3">Nueva oferta</h2>
        <Form onSubmit={crear} noValidate>
          <Row>
            <Col xs={12} md={8}>
              <Form.Group className="mb-3" controlId="productoId">
                <Form.Label>Producto</Form.Label>
                <select
                  id="productoId"
                  className={
                    errores.productoId ? "form-select is-invalid" : "form-select"
                  }
                  name="productoId"
                  value={datos.productoId}
                  onChange={cambiar}
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
                <Form.Control.Feedback type="invalid">
                  {errores.productoId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mb-3" controlId="porcentaje">
                <Form.Label>Porcentaje de descuento</Form.Label>
                <Form.Control
                  type="number"
                  name="porcentaje"
                  value={datos.porcentaje}
                  onChange={cambiar}
                  isInvalid={Boolean(errores.porcentaje)}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.porcentaje}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit">Crear oferta</Button>
        </Form>
      </section>

      {ofertas.length === 0 && <Alert>No hay ofertas activas.</Alert>}

      {ofertas.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Descuento</th>
                <th>Precio normal</th>
                <th>Precio con oferta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((oferta) => {
                const producto = buscarProducto(oferta.productoId);
                return (
                  <tr key={oferta.id}>
                    <td>{producto ? producto.nombre : oferta.productoId}</td>
                    <td>{oferta.porcentaje}%</td>
                    <td>{producto ? formatearMonto(producto.precio) : ""}</td>
                    <td>
                      {producto
                        ? formatearMonto(precioConOferta(producto.precio, oferta.porcentaje))
                        : ""}
                    </td>
                    <td>
                      <Button className="btn-sm" onClick={() => quitar(oferta)}>
                        Quitar oferta
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

export default AdminOfertas;
