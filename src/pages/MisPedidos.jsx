import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";

import { listarMisPedidos } from "../services/pedidoService";
import { formatearPrecio } from "../utils/precio";

function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setPedidos(await listarMisPedidos());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <Spinner aria-label="Cargando pedidos" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (pedidos.length === 0) return <Alert>Todavía no tienes pedidos.</Alert>;

  return (
    <Container className="py-4">
      <h1>Mis pedidos</h1>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>N.°</th>
              <th>Fecha</th>
              <th>Entrega</th>
              <th>Pago</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.fecha}</td>
                <td>{pedido.tipoEntrega}</td>
                <td>{pedido.medioPago}</td>
                <td>{formatearPrecio(pedido.total)}</td>
                <td>{pedido.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

export default MisPedidos;
