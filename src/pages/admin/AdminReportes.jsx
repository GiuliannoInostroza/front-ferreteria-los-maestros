import { useEffect, useState } from "react";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import { listarPedidos, listarDetallesReporte } from "../../services/pedidoService";
import { formatearMonto } from "../../utils/precio";

function AdminReportes() {
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const datos = await listarPedidos();
        const productosPedido = await listarDetallesReporte();
        if (activo) {
          setPedidos(datos);
          setDetalles(productosPedido);
        }
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const cumpleEstado = estado === "Todos" || pedido.estado === estado;

    const cumpleDesde = !desde || (pedido.fecha && pedido.fecha >= desde);

    const cumpleHasta = !hasta || (pedido.fecha && pedido.fecha <= hasta);

    return cumpleEstado && cumpleDesde && cumpleHasta;
  });

  const pendientes = pedidosFiltrados.filter(
    (pedido) => pedido.estado === "Pendiente",
  ).length;

  const entregados = pedidosFiltrados.filter(
    (pedido) => pedido.estado === "Entregado",
  ).length;

  const montoTotal = pedidosFiltrados
    .filter((pedido) => pedido.estado !== "Cancelado")
    .reduce((suma, pedido) => suma + Number(pedido.total || 0), 0);

  const estados = [...new Set(pedidos.map((pedido) => pedido.estado))]
    .filter(Boolean)
    .sort();

  // Contamos los pedidos realizados por cada cliente.
  const resumenClientes = {};
  for (const pedido of pedidosFiltrados) {
    if (pedido.estado === "Cancelado" || !pedido.correoCliente) continue;

    const correo = pedido.correoCliente;
    if (!resumenClientes[correo]) {
      resumenClientes[correo] = { correo, cantidad: 0, total: 0 };
    }
    resumenClientes[correo].cantidad += 1;
    resumenClientes[correo].total += Number(pedido.total || 0);
  }
  const clientesFrecuentes = Object.values(resumenClientes)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  // Contamos las unidades vendidas por producto, sin incluir pedidos cancelados.
  const resumenProductos = {};
  for (const detalle of detalles) {
    const pedido = pedidosFiltrados.find((p) => p.id === detalle.pedidoId);
    if (!pedido || pedido.estado === "Cancelado") continue;

    const codigo = detalle.codigoProducto;
    if (!resumenProductos[codigo]) {
      resumenProductos[codigo] = {
        codigo,
        nombre: detalle.nombreProducto,
        cantidad: 0,
      };
    }
    resumenProductos[codigo].cantidad += Number(detalle.cantidad || 0);
  }
  const productosMasVendidos = Object.values(resumenProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  if (cargando) {
    return (
      <Container className="py-4">
        <Spinner aria-label="Cargando reportes" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1>Reportes administrativos</h1>
      <p className="text-secondary">
        Resumen de pedidos registrados en la ferretería.
      </p>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <label htmlFor="estadoReporte" className="form-label">
            Estado
          </label>
          <select
            id="estadoReporte"
            className="form-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {estados.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </Col>

        <Col md={4}>
          <label htmlFor="fechaDesde" className="form-label">
            Desde
          </label>
          <input
            id="fechaDesde"
            type="date"
            className="form-control"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </Col>

        <Col md={4}>
          <label htmlFor="fechaHasta" className="form-label">
            Hasta
          </label>
          <input
            id="fechaHasta"
            type="date"
            className="form-control"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        {[
          ["Total de pedidos", pedidosFiltrados.length],
          ["Pendientes", pendientes],
          ["Entregados", entregados],
          ["Monto de pedidos", formatearMonto(montoTotal)],
        ].map(([titulo, valor]) => (
          <Col md={6} lg={3} key={titulo}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6 text-secondary">{titulo}</h2>
                <p className="fs-4 fw-bold mb-0">{valor}</p>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <p className="text-secondary small">
        El monto excluye pedidos cancelados y no representa necesariamente pagos
        recibidos.
      </p>

      <h2 className="h4">Clientes más frecuentes</h2>
      <p className="text-secondary small">
        Se cuentan los pedidos no cancelados dentro de los filtros elegidos.
      </p>
      {clientesFrecuentes.length === 0 ? (
        <Alert variant="info">No hay clientes para mostrar.</Alert>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pedidos</th>
                <th>Monto de pedidos</th>
              </tr>
            </thead>
            <tbody>
              {clientesFrecuentes.map((cliente) => (
                <tr key={cliente.correo}>
                  <td>{cliente.correo}</td>
                  <td>{cliente.cantidad}</td>
                  <td>{formatearMonto(cliente.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="h4">Productos más vendidos</h2>
      <p className="text-secondary small">
        Unidades registradas en pedidos no cancelados dentro de los filtros.
      </p>
      {productosMasVendidos.length === 0 ? (
        <Alert variant="info">No hay productos vendidos para mostrar.</Alert>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {productosMasVendidos.map((producto) => (
                <tr key={producto.codigo}>
                  <td>{producto.nombre}</td>
                  <td>{producto.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="h4">Detalle de pedidos</h2>

      {pedidosFiltrados.length === 0 ? (
        <Alert variant="info">
          No hay pedidos para los filtros seleccionados.
        </Alert>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>N.°</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Entrega</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.correoCliente}</td>
                  <td>{pedido.tipoEntrega}</td>
                  <td>{pedido.estado}</td>
                  <td>{formatearMonto(Number(pedido.total || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

export default AdminReportes;
