import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

import { buscarBlog } from "../services/blogService";

function BlogDetalle() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarBlog() {
      try {
        setError("");
        setBlog(await buscarBlog(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarBlog();
  }, [id]);

  if (cargando) {
    return (
      <Container className="py-4">
        <p>Cargando artículo...</p>
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container className="py-4">
        <p role="alert">{error || "El artículo solicitado no existe."}</p>
        <Link to="/blogs">Volver al blog</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <article className="mx-auto contenido-blog">
        <p className="text-secondary">{blog.categoria}</p>
        <h1>{blog.titulo}</h1>
        <p className="text-secondary">{blog.fecha}</p>

        {blog.imagen && (
          <img
            src={blog.imagen}
            alt={blog.titulo}
            className="img-fluid rounded mb-4 blog-detalle-img"
          />
        )}

        <p>{blog.contenido}</p>

        <Link to="/blogs">Volver al blog</Link>
      </article>
    </Container>
  );
}

export default BlogDetalle;
