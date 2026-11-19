import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listarBlogs } from "../services/blogService";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarBlogs() {
      try {
        const datos = await listarBlogs();
        setBlogs(datos);
      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarBlogs();
  }, []);

  if (cargando) {
    return <p>Cargando artículos...</p>;
  }

  if (error) {
    return <p role="alert">Error: {error}</p>;
  }

  return (
    <Container className="py-4">
      <header className="mb-4">
        <p className="text-secondary mb-2">Consejos y novedades</p>
        <h1>Blog de Ferretería Los Maestros</h1>
        <p>
          Consejos prácticos sobre herramientas, construcción, reparación y
          mantenimiento.
        </p>
      </header>

      <Row className="g-4">
        {blogs.map((blog) => (
          <Col xs={12} md={6} key={blog.id}>
            <article className="card h-100">
              <img
                src={blog.imagen}
                alt={blog.titulo}
                className="card-img-top blog-img"
              />
              <div className="card-body">
                <p className="text-secondary">{blog.fecha}</p>
                <h2 className="h5">
                  <Link to={`/blogs/${blog.id}`}>{blog.titulo}</Link>
                </h2>
                <p>{blog.resumen}</p>
                <Link to={`/blogs/${blog.id}`}>Leer artículo</Link>
              </div>
            </article>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Blogs;
