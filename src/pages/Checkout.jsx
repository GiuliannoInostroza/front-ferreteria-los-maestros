import { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { guardarProductos, leerProductos } from "../utils/persistencia";

import CompraExitosa from "../components/CompraExitosa";
import { crearPedido } from "../services/pedidoService";
import CompraFallida from "../components/CompraFallida";
import {
  actualizarConCatalogo,
  calcularTotal,
  hayProductoSinStock,
} from "../utils/carrito";
import { formatearPrecio } from "../utils/precio";
import { hayErrores, validarCheckout } from "../utils/validaciones";

const inicial = {
  nombre: "",
  correo: "",
  entrega: "Retiro en tienda",
  direccion: "",
  medioPago: "Pago en tienda",
};

function descontarStock(carrito) {
  const productosActuales = leerProductos();

  const productosActualizados = productosActuales.map((producto) => {
    const comprado = carrito.find((item) => item.codigo === producto.codigo);

    if (!comprado) return producto;

    return {
      ...producto,
      stock: producto.stock - comprado.cantidad,
    };
  });

  guardarProductos(productosActualizados);
}
function Checkout({ carrito, usuario, onVaciar }) {
  const [datos, setDatos] = useState(
    usuario
      ? { ...inicial, nombre: usuario.nombre, correo: usuario.correo }
      : inicial,
  );
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState("");
  const [pedido, setPedido] = useState(null);

  const vigente = actualizarConCatalogo(carrito, leerProductos());

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  async function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = validarCheckout(datos);

    setErrores(nuevosErrores);
    if (hayErrores(nuevosErrores)) return;

    if (hayProductoSinStock(vigente)) {
      setResultado("fallida");
      return;
    }

    try {
      const creado = await crearPedido({
        tipoEntrega: datos.entrega,
        direccionDespacho:
          datos.entrega === "Despacho a domicilio" ? datos.direccion : "",
        medioPago: datos.medioPago,
        detalles: vigente.map((item) => ({
          codigoProducto: item.codigo,
          nombreProducto: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
      });

      setPedido({
        ...datos,
        numero: creado.id,
        direccion: creado.direccionDespacho,
        productos: vigente,
        total: creado.total,
      });

      descontarStock(vigente);

      setResultado("exitosa");
      onVaciar();
    } catch {
      setResultado("fallida");
    }
  }

  if (resultado === "exitosa") {
    return <CompraExitosa pedido={pedido} />;
  }

  if (resultado === "fallida") {
    return <CompraFallida onReintentar={() => setResultado("")} />;
  }

  if (carrito.length === 0) {
    return (
      <Container className="py-4">
        <h1>Finalizar compra</h1>
        <p className="text-secondary">No hay productos en tu carrito.</p>
        <Link to="/productos">Ver productos</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Finalizar compra</h1>

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Form onSubmit={enviar} noValidate>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={datos.nombre}
                onChange={cambiar}
                isInvalid={Boolean(errores.nombre)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.nombre}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="correo">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={datos.correo}
                onChange={cambiar}
                isInvalid={Boolean(errores.correo)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.correo}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="entrega">
              <Form.Label>Entrega</Form.Label>
              <select
                className="form-select"
                id="entrega"
                name="entrega"
                value={datos.entrega}
                onChange={cambiar}
              >
                <option>Retiro en tienda</option>
                <option>Despacho a domicilio</option>
              </select>
            </Form.Group>

            {datos.entrega === "Despacho a domicilio" && (
              <Form.Group className="mb-3" controlId="direccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  name="direccion"
                  value={datos.direccion}
                  onChange={cambiar}
                  isInvalid={Boolean(errores.direccion)}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.direccion}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="medioPago">
              <Form.Label>Medio de pago</Form.Label>
              <select
                className="form-select"
                id="medioPago"
                name="medioPago"
                value={datos.medioPago}
                onChange={cambiar}
              >
                <option>Pago en tienda</option>
                <option>Transferencia</option>
              </select>
            </Form.Group>

            <button type="submit" className="btn btn-warning">
              Confirmar compra
            </button>
          </Form>
        </Col>

        <Col xs={12} lg={5}>
          <aside className="resumen">
            <h2 className="h4">Tu pedido</h2>

            {vigente.map((item) => (
              <p
                className="d-flex justify-content-between text-secondary"
                key={item.codigo}
              >
                <span className="text-break">
                  {item.cantidad} x {item.nombre}
                </span>
                <span>{formatearPrecio(item.precio * item.cantidad)}</span>
              </p>
            ))}

            <p className="resumen-total mb-0">
              Total: {formatearPrecio(calcularTotal(vigente))}
            </p>
          </aside>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
