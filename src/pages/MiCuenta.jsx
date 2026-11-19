import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";

import { miCuenta, misMovimientos } from "../services/cuentaService";
import { formatearMonto } from "../utils/precio";

function MiCuenta() {
  const [cuenta, setCuenta] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setCuenta(await miCuenta());
        setMovimientos(await misMovimientos());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <Spinner aria-label="Cargando cuenta corriente" />;
  if (error === "Solicitud rechazada: 404") {
    return (
      <Container className="py-4">
        <h1>Mi cuenta corriente</h1>
        <Alert>No tienes una cuenta corriente. Pídela en la ferretería.</Alert>
      </Container>
    );
  }
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-4">
      <h1>Mi cuenta corriente</h1>

      <div className="bg-body-tertiary rounded p-4 mb-4">
        <p className="mb-1">
          <strong>Saldo pendiente:</strong> {formatearMonto(cuenta.saldo)}
        </p>
        <p className="mb-1">
          <strong>Límite de crédito:</strong> {formatearMonto(cuenta.limite)}
        </p>
        <p className="mb-1">
          <strong>Disponible:</strong> {formatearMonto(cuenta.limite - cuenta.saldo)}
        </p>
        <p className="mb-0">
          <strong>Estado:</strong> {cuenta.activa ? "Activa" : "Inactiva"}
        </p>
      </div>

      <h2 className="h4">Historial</h2>
      {movimientos.length === 0 && <Alert>Todavía no tienes movimientos.</Alert>}

      {movimientos.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Pedido</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td>{movimiento.fecha}</td>
                  <td>{movimiento.tipo}</td>
                  <td>{movimiento.descripcion}</td>
                  <td>{movimiento.pedidoId}</td>
                  <td>{formatearMonto(movimiento.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

export default MiCuenta;
