import { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

import CompraExitosa from "../components/CompraExitosa";
import { cargarCatalogo, descontarStock } from "../services/catalogoService";
import { crearPedido } from "../services/pedidoService";
import { miCuenta, cargarAMiCuenta } from "../services/cuentaService";
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
  comuna: "",
  medioPago: "Pago en tienda",
};

function Checkout({ carrito, usuario, onVaciar }) {
  const [datos, setDatos] = useState(
    usuario
      ? { ...inicial, nombre: usuario.nombre, correo: usuario.correo }
      : inicial,
  );
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState("");
  const [pedido, setPedido] = useState(null);
  // INTEGRACION_CREDITO_FL_MAESTROS
  const [cuentaCredito, setCuentaCredito] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");
  const [pedidoParcial, setPedidoParcial] = useState(null);

  const [catalogo, setCatalogo] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const actual = await cargarCatalogo();
        setCatalogo(actual.productos);
      } catch {
        setCatalogo(null);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    let vigente = true;
    miCuenta()
      .then((cuenta) => {
        if (vigente && cuenta?.activa) setCuentaCredito(cuenta);
      })
      .catch(() => {
        if (vigente) setCuentaCredito(null);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const vigente = catalogo ? actualizarConCatalogo(carrito, catalogo) : carrito;

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando || pedidoParcial) return;
    setErrorCompra("");

    const nuevosErrores = validarCheckout(datos);
    if (datos.entrega === "Despacho a domicilio") {
      if (datos.comuna !== "La Serena") {
        nuevosErrores.comuna = "Solo realizamos despachos en La Serena";
      }
    }

    setErrores(nuevosErrores);
    if (hayErrores(nuevosErrores)) return;

    setEnviando(true);
    try {
      const actual = await cargarCatalogo();
      const items = actualizarConCatalogo(carrito, actual.productos);

      if (hayProductoSinStock(items)) {
        setResultado("fallida");
        return;
      }

      if (datos.medioPago === "Cuenta corriente") {
        const cuentaActual = await miCuenta();
        const disponible = cuentaActual.limite - cuentaActual.saldo;
        if (!cuentaActual.activa || disponible < calcularTotal(items)) {
          setErrorCompra(
            "La cuenta está inactiva o no tiene crédito suficiente. No se creó ningún pedido.",
          );
          return;
        }
      }

      const creado = await crearPedido({
        tipoEntrega: datos.entrega,
        direccionDespacho:
          datos.entrega === "Despacho a domicilio" ? datos.direccion : "",
        medioPago: datos.medioPago,
        detalles: items.map((item) => ({
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
        productos: items,
        total: creado.total,
      });

      // El pedido se creó. Si una operación posterior falla, NO se debe reintentar
      // el checkout porque crearía un segundo pedido (son microservicios separados).
      try {
        await descontarStock(
          items.map((item) => ({
            productoId: item.id,
            cantidad: item.cantidad,
          })),
        );
        if (datos.medioPago === "Cuenta corriente") {
          await cargarAMiCuenta({
            monto: creado.total,
            descripcion: `Compra pedido #${creado.id}`,
            pedidoId: creado.id,
          });
        }
      } catch (error) {
        setPedidoParcial(creado.id);
        setErrorCompra(
          `El pedido #${creado.id} fue creado, pero falló una operación posterior (stock o crédito). NO repitas la compra. Consulta Mis pedidos y avisa al administrador. Detalle: ${error.message}`,
        );
        return;
      }

      setResultado("exitosa");
      onVaciar();
    } catch (error) {
      setErrorCompra(
        error?.message ||
          "No se pudo procesar la compra. Comprueba Mis pedidos antes de reintentar.",
      );
    } finally {
      setEnviando(false);
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
            {errorCompra && (
              <div className="alert alert-danger" role="alert">
                {errorCompra}
              </div>
            )}
            {pedidoParcial && (
              <p className="alert alert-warning">
                El pedido #{pedidoParcial} ya existe. No lo envíes otra vez.{" "}
                <Link to="/mis-pedidos">Ver mis pedidos</Link>.
              </p>
            )}
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
                readOnly
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
              <>
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

                <Form.Group className="mb-3" controlId="comuna">
                  <Form.Label>Comuna</Form.Label>

                  <Form.Select
                    name="comuna"
                    value={datos.comuna}
                    onChange={cambiar}
                    isInvalid={Boolean(errores.comuna)}
                  >
                    <option value="">Selecciona una comuna</option>
                    <option value="La Serena">La Serena</option>
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    {errores.comuna}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="mb-3">
                  <h2 className="h5">Zona de despacho</h2>
                  <p>Actualmente realizamos despachos en La Serena.</p>

                  <iframe
                    title="Mapa de La Serena"
                    src="https://www.google.com/maps?q=La+Serena,+Chile&output=embed"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </>
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
                {cuentaCredito?.activa && <option>Cuenta corriente</option>}
              </select>
              {datos.medioPago === "Cuenta corriente" && cuentaCredito && (
                <p className="mt-2 text-secondary">
                  Crédito disponible:{" "}
                  {formatearPrecio(cuentaCredito.limite - cuentaCredito.saldo)}
                </p>
              )}
            </Form.Group>

            <button
              type="submit"
              className="btn btn-warning"
              disabled={enviando || Boolean(pedidoParcial)}
            >
              {enviando ? "Procesando..." : "Confirmar compra"}
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
