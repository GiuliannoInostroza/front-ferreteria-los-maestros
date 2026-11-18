import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";

import {
  crearCuenta,
  eliminarCuenta,
  listarCuentas,
  listarMovimientos,
  registrarAbono,
} from "../../services/cuentaService";
import { formatearMonto } from "../../utils/precio";

const cuentaInicial = { correoCliente: "", limite: "" };
const abonoInicial = { monto: "", descripcion: "" };

function AdminCuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [datos, setDatos] = useState(cuentaInicial);
  const [errores, setErrores] = useState({});
  const [seleccionada, setSeleccionada] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [abono, setAbono] = useState(abonoInicial);
  const [errorAbono, setErrorAbono] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setCuentas(await listarCuentas());
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

  function cambiarAbono(evento) {
    const { name, value } = evento.target;
    setAbono({ ...abono, [name]: value });
  }

  async function crear(evento) {
    evento.preventDefault();

    const nuevosErrores = {};
    if (datos.correoCliente.trim() === "") {
      nuevosErrores.correoCliente = "El correo del cliente es obligatorio";
    }
    if (datos.limite === "" || !(Number(datos.limite) >= 0)) {
      nuevosErrores.limite = "El límite debe ser 0 o más";
    }
    setErrores(nuevosErrores);
    if (nuevosErrores.correoCliente || nuevosErrores.limite) return;

    try {
      setError("");
      const creada = await crearCuenta({
        correoCliente: datos.correoCliente.trim(),
        limite: Number(datos.limite),
      });
      setCuentas([...cuentas, creada]);
      setMensaje("Cuenta corriente creada correctamente");
      setDatos(cuentaInicial);
    } catch (e) {
      setError(e.message);
    }
  }

  async function verMovimientos(cuenta) {
    try {
      setError("");
      setMovimientos(await listarMovimientos(cuenta.id));
      setSeleccionada(cuenta);
      setAbono(abonoInicial);
      setErrorAbono("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function abonar(evento) {
    evento.preventDefault();

    if (!(Number(abono.monto) > 0)) {
      setErrorAbono("El monto debe ser mayor que 0");
      return;
    }

    try {
      setError("");
      setErrorAbono("");
      const nuevo = await registrarAbono(seleccionada.id, {
        monto: Number(abono.monto),
        descripcion: abono.descripcion,
      });
      const saldoNuevo = seleccionada.saldo - nuevo.monto;
      setMovimientos([...movimientos, nuevo]);
      setSeleccionada({ ...seleccionada, saldo: saldoNuevo });
      setCuentas(
        cuentas.map((item) =>
          item.id === seleccionada.id ? { ...item, saldo: saldoNuevo } : item
        )
      );
      setMensaje("Pago registrado correctamente");
      setAbono(abonoInicial);
    } catch (e) {
      setError(e.message);
    }
  }

  async function borrar(cuenta) {
    if (!window.confirm("¿Eliminar esta cuenta corriente?")) return;

    try {
      setError("");
      await eliminarCuenta(cuenta.id);
      setCuentas(cuentas.filter((item) => item.id !== cuenta.id));
      if (seleccionada && seleccionada.id === cuenta.id) setSeleccionada(null);
      setMensaje("Cuenta corriente eliminada correctamente");
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <Spinner aria-label="Cargando cuentas corrientes" />;

  return (
    <Container className="py-4">
      <h1>Cuentas corrientes</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

      <section className="bg-body-tertiary rounded p-4 mb-4">
        <h2 className="h4 mb-3">Nueva cuenta corriente</h2>
        <Form onSubmit={crear} noValidate>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="correoCliente">
                <Form.Label>Correo del cliente</Form.Label>
                <Form.Control
                  name="correoCliente"
                  value={datos.correoCliente}
                  onChange={cambiar}
                  isInvalid={Boolean(errores.correoCliente)}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.correoCliente}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="limite">
                <Form.Label>Límite de crédito</Form.Label>
                <Form.Control
                  type="number"
                  name="limite"
                  value={datos.limite}
                  onChange={cambiar}
                  isInvalid={Boolean(errores.limite)}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.limite}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit">Crear cuenta</Button>
        </Form>
      </section>

      {cuentas.length === 0 && <Alert>No hay cuentas corrientes.</Alert>}

      {cuentas.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Límite</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((cuenta) => (
                <tr key={cuenta.id}>
                  <td>{cuenta.correoCliente}</td>
                  <td>{formatearMonto(cuenta.limite)}</td>
                  <td>{formatearMonto(cuenta.saldo)}</td>
                  <td>{cuenta.activa ? "Activa" : "Inactiva"}</td>
                  <td>
                    <div className="d-grid gap-2 d-md-flex">
                      <Button className="btn-sm" onClick={() => verMovimientos(cuenta)}>
                        Ver movimientos
                      </Button>
                      <Button className="btn-sm" onClick={() => borrar(cuenta)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {seleccionada && (
        <section className="bg-body-tertiary rounded p-4 mt-4">
          <h2 className="h4">Movimientos de {seleccionada.correoCliente}</h2>
          <p>
            <strong>Saldo pendiente:</strong> {formatearMonto(seleccionada.saldo)}
          </p>

          {movimientos.length === 0 && <Alert>Esta cuenta no tiene movimientos.</Alert>}

          {movimientos.length > 0 && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Detalle</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>{movimiento.fecha}</td>
                      <td>{movimiento.tipo}</td>
                      <td>{movimiento.descripcion}</td>
                      <td>{formatearMonto(movimiento.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="h5 mt-4">Registrar un pago</h3>
          <Form onSubmit={abonar} noValidate>
            <Row>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3" controlId="monto">
                  <Form.Label>Monto del pago</Form.Label>
                  <Form.Control
                    type="number"
                    name="monto"
                    value={abono.monto}
                    onChange={cambiarAbono}
                    isInvalid={Boolean(errorAbono)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorAbono}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={8}>
                <Form.Group className="mb-3" controlId="descripcion">
                  <Form.Label>Detalle</Form.Label>
                  <Form.Control
                    name="descripcion"
                    value={abono.descripcion}
                    onChange={cambiarAbono}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit">Registrar pago</Button>
          </Form>
        </section>
      )}
    </Container>
  );
}

export default AdminCuentas;
