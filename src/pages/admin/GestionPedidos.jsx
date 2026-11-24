import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import MapaDespacho from "../../components/MapaDespacho";
import { actualizarPedido, listarPedidos, listarDetallesPedido } from "../../services/pedidoService";
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
  const [pedidoMapa, setPedidoMapa] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

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
      const actualizado = await actualizarPedido(pedido.id, {
        ...pedido,
        estado,
      });
      setPedidos((actual) =>
        actual.map((p) => (p.id === pedido.id ? actualizado : p)),
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function verDetalle(pedido) {
    setPedidoDetalle(pedido);
    setDetalles([]);
    setErrorDetalle("");
    setCargandoDetalle(true);
    try {
      setDetalles(await listarDetallesPedido(pedido.id));
    } catch (e) {
      setErrorDetalle(e.message);
    } finally {
      setCargandoDetalle(false);
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
              <th>Ubicación</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.correoCliente}</td>
                <td>{pedido.fecha}</td>
                <td>{pedido.tipoEntrega}</td>
                <td>{formatearPrecio(pedido.total)}</td>
                <td>
                  <select
                    className="form-select"
                    aria-label={`Estado del pedido ${pedido.id}`}
                    value={pedido.estado}
                    onChange={(e) => cambiarEstado(pedido, e.target.value)}
                  >
                    {estados.map((estado) => (
                      <option key={estado}>{estado}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {pedido.tipoEntrega === "Despacho a domicilio" &&
                  pedido.direccionDespacho ? (
                    <button
                      type="button"
                      className="btn btn-outline-warning btn-sm"
                      onClick={() =>
                        setPedidoMapa((actual) =>
                          actual && actual.id === pedido.id ? null : pedido,
                        )
                      }
                    >
                      {pedidoMapa && pedidoMapa.id === pedido.id
                        ? "Ocultar mapa"
                        : "Ver mapa"}
                    </button>
                  ) : (
                    <span className="text-secondary">No aplica</span>
                  )}
                </td>
                <td>
                  <button type="button" className="btn btn-outline-warning btn-sm"
                    disabled={cargandoDetalle} onClick={() => verDetalle(pedido)}>Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pedidoDetalle && (
        <section className="bg-body-tertiary rounded p-3 mt-4">
          <h2 className="h4">Detalle del pedido N.° {pedidoDetalle.id}</h2>
          <p>Cliente: {pedidoDetalle.correoCliente} · Pago: {pedidoDetalle.medioPago}</p>
          {pedidoDetalle.direccionDespacho && <p>Dirección: {pedidoDetalle.direccionDespacho}</p>}
          {cargandoDetalle && <Spinner aria-label="Cargando detalle" />}
          {errorDetalle && <Alert variant="danger">{errorDetalle}</Alert>}
          {!cargandoDetalle && !errorDetalle && (
            detalles.length ? (
              <ul>
                {detalles.map(detalle => (
                  <li key={detalle.id}>{detalle.nombreProducto} — {detalle.cantidad} x {formatearPrecio(detalle.precioUnitario)}</li>
                ))}
              </ul>
            ) : <p>No hay productos registrados.</p>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPedidoDetalle(null)}>Cerrar detalle</button>
        </section>
      )}
      {pedidoMapa && <MapaDespacho direccion={pedidoMapa.direccionDespacho} />}
    </Container>
  );
}

export default GestionPedidos;
