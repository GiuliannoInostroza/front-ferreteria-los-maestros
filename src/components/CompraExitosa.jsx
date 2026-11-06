import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

import { formatearPrecio } from "../utils/precio";

function CompraExitosa({ pedido }) {
  return (
    <Container className="py-4">
      <h1>Compra exitosa</h1>
      <p className="text-success fw-bold">
        Gracias por tu compra, {pedido.nombre}. Esta simulación no incluye pago
        real.
      </p>

      <section className="resumen mb-4">
        <h2 className="h4">Resumen del pedido</h2>
        <p className="mb-1">
          <strong>Pedido N.°:</strong> {pedido.numero}
        </p>
        <p className="mb-1">
          <strong>Correo:</strong> {pedido.correo}
        </p>
        <p className="mb-1">
          <strong>Entrega:</strong> {pedido.entrega}
        </p>

        <p className="mb-1">
          <strong>Medio de pago:</strong> {pedido.medioPago}
        </p>

        {pedido.direccion && (
          <p className="mb-1">
            <strong>Dirección:</strong> {pedido.direccion}
          </p>
        )}

        <div className="table-responsive mt-3">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.productos.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatearPrecio(item.precio * item.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="resumen-total mb-0">
          Total pagado: {formatearPrecio(pedido.total)}
        </p>
      </section>

      <Link className="btn btn-warning" to="/productos">
        Seguir comprando
      </Link>
    </Container>
  );
}

export default CompraExitosa;
