import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../services/authService";

const inicial = { correo: "", password: "" };

function Login({ usuario, onIngresar, onSalir }) {
  const [datos, setDatos] = useState(inicial);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  function salir() {
    onSalir();
    setMensaje("Cerraste sesión correctamente");
  }

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const sesion = await login(datos);
      const usuarioSesion = {
        nombre: sesion.nombre,
        correo: sesion.correo,
        rol: sesion.rol,
      };
      sessionStorage.setItem("token", sesion.token);
      sessionStorage.setItem("usuario", JSON.stringify(usuarioSesion));
      onIngresar(usuarioSesion);
      setMensaje("");
      setDatos(inicial);
      navigate("/productos");
    } catch {
      setError("No fue posible iniciar sesión");
    } finally {
      setEnviando(false);
    }
  }

  if (usuario) {
    return (
      <Container className="py-4">
        <h1>Sesión iniciada</h1>
        <p>
          Hola, {usuario.nombre}. Tu rol es <strong>{usuario.rol}</strong>.
        </p>

        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-warning" to="/productos">
            Ver productos
          </Link>

          {usuario.rol !== "Cliente" && (
            <Link className="btn btn-outline-light" to="/admin/productos">
              Ir a administración
            </Link>
          )}

          <button className="btn btn-outline-light" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="resumen mx-auto formulario-login">
        <img
          className="d-block mx-auto mb-3 logo-login"
          src="/assets/img/logo.png"
          alt="Logo de la ferretería"
        />
        <h1 className="h3 mb-4 text-center">Iniciar sesión</h1>

        {mensaje && <p className="text-success fw-bold">{mensaje}</p>}

        <Form onSubmit={enviar}>
          <Form.Group className="mb-3" controlId="correo">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={datos.correo}
              onChange={cambiar}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={datos.password}
              onChange={cambiar}
              required
            />
          </Form.Group>

          {error && (
            <p className="text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
        </Form>

        <p className="mt-3 mb-0">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </div>
    </Container>
  );
}

export default Login;
