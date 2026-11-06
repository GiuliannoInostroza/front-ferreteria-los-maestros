import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { eliminarUsuario, listarUsuarios } from "../../services/usuarioService";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setUsuarios(await listarUsuarios());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function borrar(id) {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      setUsuarios(actual => actual.filter(u => u.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <Spinner aria-label="Cargando usuarios" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (usuarios.length === 0) return <Alert>No hay usuarios.</Alert>;

  return (
    <Container className="py-4">
      <h1>Administración de usuarios</h1>
      <Link className="btn btn-primary mb-4" to="/admin/usuarios/nuevo">
        Nuevo usuario
      </Link>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.activo ? "Activo" : "Inactivo"}</td>
                <td>
                  <Link to={`/admin/usuarios/${usuario.id}/editar`}>Editar</Link>
                  <button className="ms-2" onClick={() => borrar(usuario.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

export default AdminUsuarios;
