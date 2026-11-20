import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";

import { listarAlertas } from "../../services/catalogoService";

function AdminAlertas() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setProductos(await listarAlertas());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <Spinner aria-label="Cargando alertas de stock" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-4">
      <h1>Alertas de stock</h1>
      <p className="text-secondary">
        Productos que llegaron a su stock crítico y hay que reponer.
      </p>

      {productos.length === 0 && (
        <Alert>No hay productos con stock bajo.</Alert>
      )}

      {productos.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Stock</th>
                <th>Stock crítico</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.stockCritico}</td>
                  <td>{producto.stock === 0 ? "Sin stock" : "Stock bajo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

export default AdminAlertas;
