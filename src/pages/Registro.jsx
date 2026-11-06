import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

import { registrar } from "../services/authService";
import { hayErrores, validarRegistro } from "../utils/validaciones";

const inicial = { nombre: "", correo: "", contrasena: "" };

function Registro() {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [creada, setCreada] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = validarRegistro(datos, []);

    setErrores(nuevosErrores);
    if (hayErrores(nuevosErrores)) return;

    try {
      await registrar({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim().toLowerCase(),
        password: datos.contrasena,
      });
      setDatos(inicial);
      setCreada(true);
    } catch (e) {
      setErrores({ correo: e.message });
    }
  }

  if (creada) {
    return (
      <Container className="py-4">
        <h1>Cuenta creada</h1>
        <p>Tu cuenta quedó registrada como Cliente. Ya puedes iniciar sesión.</p>
        <Link className="btn btn-warning" to="/login">
          Ir a iniciar sesión
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="resumen mx-auto formulario-login">
        <h1 className="h3 mb-4">Crear cuenta</h1>

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

          <Form.Group className="mb-3" controlId="contrasena">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="contrasena"
              value={datos.contrasena}
              onChange={cambiar}
              isInvalid={Boolean(errores.contrasena)}
            />
            <Form.Control.Feedback type="invalid">
              {errores.contrasena}
            </Form.Control.Feedback>
          </Form.Group>

          <Button type="submit">Crear cuenta</Button>
        </Form>
      </div>
    </Container>
  );
}

export default Registro;
