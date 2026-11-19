import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { hayErrores, validarProducto } from "../../utils/validaciones";

const inicial = {
  codigo: "",
  nombre: "",
  marca: "",
  categoria: "",
  precio: "",
  stock: "",
  stockCritico: "",
};

function FormularioProducto({
  productos,
  categorias,
  producto,
  onGuardar,
  onCancelar,
  onModificar,
}) {
  const [datos, setDatos] = useState(producto ? producto : inicial);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    setDatos(producto ? producto : inicial);
    setErrores({});
  }, [producto]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    if (onModificar) onModificar();
  }

  function enviar(evento) {
    evento.preventDefault();
    const codigoActual = producto ? producto.codigo : "";
    const nuevosErrores = validarProducto(datos, productos, codigoActual);

    setErrores(nuevosErrores);
    if (hayErrores(nuevosErrores)) return;

    onGuardar({
      ...datos,
      codigo: datos.codigo.trim(),
      nombre: datos.nombre.trim(),
      marca: datos.marca.trim(),
      categoria: datos.categoria.trim(),
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      stockCritico: Number(datos.stockCritico),
      descripcion: producto ? producto.descripcion : "",
    });
    setDatos(inicial);
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <Row>
        <Col xs={12} md={6}>
          <Form.Group className="mb-3" controlId="codigo">
            <Form.Label>Código</Form.Label>
            <Form.Control
              name="codigo"
              value={datos.codigo}
              onChange={cambiar}
              disabled={Boolean(producto)}
              isInvalid={Boolean(errores.codigo)}
            />
            <Form.Control.Feedback type="invalid">
              {errores.codigo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
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
        </Col>

        <Col xs={12} md={6}>
          <Form.Group className="mb-3" controlId="marca">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              name="marca"
              value={datos.marca}
              onChange={cambiar}
              isInvalid={Boolean(errores.marca)}
            />
            <Form.Control.Feedback type="invalid">
              {errores.marca}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group className="mb-3" controlId="categoria">
            <Form.Label>Categoría</Form.Label>
            <select
              id="categoria"
              className={
                errores.categoria ? "form-select is-invalid" : "form-select"
              }
              name="categoria"
              value={datos.categoria}
              onChange={cambiar}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <Form.Control.Feedback type="invalid">
              {errores.categoria}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group className="mb-3" controlId="precio">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={datos.precio}
              onChange={cambiar}
              isInvalid={Boolean(errores.precio)}
            />
            <Form.Control.Feedback type="invalid">
              {errores.precio}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group className="mb-3" controlId="stock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              value={datos.stock}
              onChange={cambiar}
              isInvalid={Boolean(errores.stock)}
            />
            <Form.Control.Feedback type="invalid">
              {errores.stock}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group className="mb-3" controlId="stockCritico">
            <Form.Label>Stock crítico</Form.Label>
            <Form.Control
              type="number"
              name="stockCritico"
              value={datos.stockCritico}
              onChange={cambiar}
              isInvalid={Boolean(errores.stockCritico)}
            />
            <Form.Control.Feedback type="invalid">
              {errores.stockCritico}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit">
        {producto ? "Guardar cambios" : "Guardar"}
      </Button>{" "}
      <Button type="button" onClick={onCancelar}>
        Cancelar
      </Button>
    </Form>
  );
}

export default FormularioProducto;
