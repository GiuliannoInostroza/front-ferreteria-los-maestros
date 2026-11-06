import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";

import { actualizarPedido, listarPedidos } from "../../services/pedidoService";
import { formatearPrecio } from "../../utils/precio";

const estados = [
  "Pendiente",
  "Confirmado",
  "En preparación",
  "Listo para retiro",
  "En despacho",
  "Entregado",
  "Cancelado",
];

function GestionPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setPedidos(await listarPedidos());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function cambiarEstado(pedido, estado) {
    try {
      const actualizado = await actualizarPedido(pedido.id, { ...pedido, estado });
      setPedidos(actual => actual.map(p => (p.id === pedido.id ? actualizado : p)));
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <Spinner aria-label="Cargando pedidos" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (pedidos.length === 0) return <Alert>No hay pedidos.</Alert>;

  return (
    <Container className="py-4">
      <h1>Gestión de pedidos</h1>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>N.°</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.correoCliente}</td>
                <td>{pedido.fecha.slice(0, 10)}</td>
                <td>{pedido.tipoEntrega}</td>
                <td>{formatearPrecio(pedido.total)}</td>
                <td>
                  <select
                    className="form-select"
                    aria-label={`Estado del pedido ${pedido.id}`}
                    value={pedido.estado}
                    onChange={e => cambiarEstado(pedido, e.target.value)}
                  >
                    {estados.map(estado => (
                      <option key={estado}>{estado}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

export default GestionPedidos;
