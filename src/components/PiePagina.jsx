import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function PiePagina({ usuario }) {
  return (
    <footer className="bg-dark-subtle text-light py-5">
      <Container>
        <Row className="g-4">
          <Col xs={12} md={6}>
            <strong>Ferretería Los Maestros</strong>
            <p className="text-secondary mb-0">
              Materiales de construcción, herramientas y ferretería general en
              La Serena.
            </p>
          </Col>

          {usuario?.rol === "Vendedor" ? (
            <Col xs={6} md={3}>
              <strong>Administración</strong>
              <Link className="d-block text-secondary text-decoration-none" to="/admin/productos">Productos</Link>
              <Link className="d-block text-secondary text-decoration-none" to="/admin/pedidos">Pedidos</Link>
              <Link className="d-block text-secondary text-decoration-none" to="/login">Mi sesión</Link>
            </Col>
          ) : (
            <>
              <Col xs={6} md={3}>
                <strong>Tienda</strong>
                <Link className="d-block text-secondary text-decoration-none" to="/productos">
                  Productos
                </Link>
                <Link className="d-block text-secondary text-decoration-none" to="/carrito">
                  Carrito
                </Link>
                <Link className="d-block text-secondary text-decoration-none" to="/blogs">
                  Blogs
                </Link>
              </Col>

              <Col xs={6} md={3}>
                <strong>Cuenta</strong>
                <Link className="d-block text-secondary text-decoration-none" to="/login">
                  Iniciar sesión
                </Link>
                <Link className="d-block text-secondary text-decoration-none" to="/contacto">
                  Contacto
                </Link>
              </Col>
            </>
          )}
        </Row>
      </Container>
    </footer>
  );
}

export default PiePagina;
